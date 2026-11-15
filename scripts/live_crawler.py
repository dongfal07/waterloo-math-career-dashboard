#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career - Live North American Internship & Official Co-op Schedule Crawler
실시간 북미(캐나다/미국) 학부생 인턴십·코옵 공고(SimplifyJobs Live Feed) 및
워털루 대학교 수학과 1학년(2028 첫 코옵 타깃) 맞춤 공식 학사·코옵 일정 동기화 엔진
"""

import os
import re
import sys
import json
import html as htmllib
import urllib.request
from datetime import datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

KST = timezone(timedelta(hours=9), name="KST")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
PROFILE_PATH = os.path.join(PROJECT_ROOT, "data", "waterloo_math_profile.json")
POSTINGS_PATH = os.path.join(PROJECT_ROOT, "data", "internship_postings.json")
RESOURCES_PATH = os.path.join(PROJECT_ROOT, "data", "career_resources.json")
CORE_JS_PATH = os.path.join(PROJECT_ROOT, "web", "assets", "uw-core.js")

SIMPLIFY_README_URL = "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/README.md"
UW_IMPORTANT_DATES_URL = "https://uwaterloo.ca/co-operative-education/important-dates"

# 캐나다 도시·국가명 정규식 (미국 동명 도시 'Ontario, CA', 'Vancouver, WA', 'Burlington, VT' 오탐 차단)
CANADA_CITY_PATTERN = re.compile(
    r"\b(Canada|Quebec|Québec|British Columbia|Alberta|Manitoba|Nova Scotia|Saskatchewan|"
    r"Waterloo|Toronto|Ottawa|Montreal|Montréal|Calgary|Edmonton|Markham|Mississauga|"
    r"Kitchener|Oakville|Winnipeg|Halifax|Burnaby)\b",
    re.IGNORECASE,
)

# 캐나다 주 약어 정규식 (대소문자 엄격 구분 — 영어 전치사 'on', 'in' 오탐 원천 차단)
CANADA_PROVINCE_CODE_PATTERN = re.compile(
    r",\s*(?:ON|BC|QC|AB|MB|NS|SK|NB|NL)\b(?:\s*,\s*Canada|\s*$|\s*[;/|),])"
)

# 동명 지역 정밀 판별 ('Ontario' 나 'Vancouver' 가 미국 주 코드 WA/CA 와 결합된 경우 제외)
AMBIGUOUS_CA_PATTERN = re.compile(
    r"\b(Ontario|Vancouver)\b(?!\s*,\s*(?:CA|WA|OR|OH|NY|ID)\b)",
    re.IGNORECASE,
)

# 비북미(영국/유럽/아시아 등) 제외 정규식
NON_NA_LOC_PATTERN = re.compile(
    r"\b(UK|United Kingdom|London, UK|England|Germany|France|Singapore|Hong Kong|Tokyo|Japan|"
    r"Australia|Sydney|Amsterdam|Netherlands|Dublin|Ireland|India|Zurich|Switzerland|Poland|Spain)\b",
    re.IGNORECASE,
)

# 보험계리/리스크 트랙 판별 키워드
ACTUARY_ROLE_PATTERN = re.compile(
    r"\b(Actuar\w*|Underwrit\w*|Insurance|Pension|Annuity|Risk Analytics|Risk Model\w*|Credit Risk|Market Risk|Enterprise Risk)\b",
    re.IGNORECASE,
)


def is_canada_location(loc_str):
    """위치 문자열이 캐나다 지역인지 정밀 판별합니다 ('on-site', 'Ontario, CA', 'Burlington, VT' 등 오탐 방지)."""
    s = (loc_str or "").strip()
    if not s:
        return False
    if CANADA_CITY_PATTERN.search(s):
        return True
    if CANADA_PROVINCE_CODE_PATTERN.search(s):
        return True
    if AMBIGUOUS_CA_PATTERN.search(s):
        return True
    return False


def clean_html_text(raw_html):
    """HTML 태그 및 엔티티를 제거하고 깔끔한 단일 행 문자열로 변환합니다."""
    text = re.sub(r"<br\s*/?>", ", ", raw_html)
    text = re.sub(r"<summary>.*?</summary>", "", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", "", text)
    text = htmllib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def parse_age_days(age_str):
    """'0d', '3d', '1mo' 등의 문자열을 일(day) 단위 정수로 변환합니다."""
    s = (age_str or "").strip().lower()
    m_day = re.match(r"^(\d+)\s*d$", s)
    if m_day:
        return int(m_day.group(1))
    m_hr = re.match(r"^(\d+)\s*h", s)
    if m_hr:
        return 0
    m_mo = re.match(r"^(\d+)\s*mo", s)
    if m_mo:
        return int(m_mo.group(1)) * 30
    return 999


def extract_tags(role, track, company):
    """직무명과 트랙에 따라 핵심 기술/역량 태그를 생성합니다 (단어 경계 매칭으로 Grainger->AI 등 오탐 방지)."""
    tags = []
    text = f"{role} {company}"
    keyword_patterns = [
        (r"\bquant\w*\b", "Quantitative Modeling"),
        (r"\btrading\b", "Algorithmic Trading"),
        (r"\brisk\b", "Risk Analytics"),
        (r"\bactuar\w*\b", "Actuarial Science"),
        (r"\b(?:machine learning|deep learning|ml)\b", "Machine Learning"),
        (r"\b(?:ai|llm|genai|agentic)\b", "AI / LLM"),
        (r"\bdata\b", "Data Science"),
        (r"\banalytics\b", "Statistical Analysis"),
        (r"\bpython\b", "Python"),
        (r"c\+\+", "C++"),
        (r"\bbackend\b", "Backend Systems"),
        (r"\bfull[- ]?stack\b", "Full-Stack"),
        (r"\bcloud\b", "Cloud Infra"),
        (r"\bco-?op\b", "Waterloo Co-op"),
    ]
    for pat, label in keyword_patterns:
        if re.search(pat, text, re.IGNORECASE) and label not in tags:
            tags.append(label)

    default_by_track = {
        "quant": ["Python", "Probability & Stats", "Stochastic Modeling", "C++"],
        "data_ai": ["Python", "SQL", "Machine Learning", "Statistics"],
        "software": ["Algorithms", "Python / C++", "Distributed Systems", "Git"],
        "actuary": ["SOA Exam P/FM", "Risk Modeling", "Excel / R", "Financial Math"],
    }
    for d in default_by_track.get(track, ["Mathematics", "Problem Solving"]):
        if len(tags) >= 4:
            break
        if d not in tags:
            tags.append(d)
    return tags[:4]


def estimate_compensation(country, track, company, role):
    """국가 및 직무 트랙 기준 학부 인턴십 시급/급여 가이드라인 표기"""
    comp_lower = (company or "").lower()
    if any(
        k in comp_lower
        for k in (
            "citadel",
            "jane street",
            "two sigma",
            "hrt",
            "hudson river",
            "jump trading",
            "five rings",
            "de shaw",
            "d. e. shaw",
        )
    ):
        return "$85 ~ $110 / hr USD"
    if any(
        k in comp_lower
        for k in (
            "schonfeld",
            "balyasny",
            "point72",
            "millennium",
            "sig",
            "susquehanna",
            "optiver",
            "imc",
            "akuna",
            "arrowstreet",
            "tower research",
        )
    ):
        return "$70 ~ $95 / hr USD"
    if any(
        k in comp_lower
        for k in (
            "amazon",
            "google",
            "meta",
            "apple",
            "microsoft",
            "nvidia",
            "stripe",
            "databricks",
            "openai",
            "anthropic",
            "roku",
            "roblox",
            "shopify",
        )
    ):
        return "$45 ~ $65 / hr CAD" if country == "CA" else "$50 ~ $68 / hr USD"
    if country == "CA":
        if track == "quant":
            return "$30 ~ $45 / hr CAD (Co-op)"
        if track == "data_ai":
            return "$27 ~ $38 / hr CAD (Co-op)"
        if track == "actuary":
            return "$25 ~ $34 / hr CAD (Co-op)"
        return "$28 ~ $42 / hr CAD (Co-op)"
    else:
        if track == "quant":
            return "$55 ~ $85 / hr USD"
        if track == "data_ai":
            return "$38 ~ $55 / hr USD"
        if track == "actuary":
            return "$30 ~ $45 / hr USD"
        return "$40 ~ $60 / hr USD"


def fetch_live_simplify_postings(base_date=None):
    """
    SimplifyJobs GitHub 실시간 피드에서 북미(CA/US) 학부생 지원 가능 공고를 수집합니다.
    """
    base_date = base_date or datetime.now(KST).date()
    req = urllib.request.Request(SIMPLIFY_README_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        readme = resp.read().decode("utf-8", errors="ignore")

    sections = [
        ("quant", "Quantitative Finance Internship Roles"),
        ("data_ai", "Data Science, AI & Machine Learning Internship Roles"),
        ("software", "Software Engineering Internship Roles"),
    ]

    collected = []
    seen_keys = set()

    for base_track, header in sections:
        start = readme.find(header)
        if start == -1:
            continue
        next_sec = readme.find("\n## ", start + len(header))
        chunk = readme[start:next_sec] if next_sec != -1 else readme[start:]
        rows = re.findall(r"<tr>(.*?)</tr>", chunk, re.DOTALL)
        last_company = ""

        for row in rows:
            tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL)
            if len(tds) < 5:
                continue
            comp_raw, role_raw, loc_raw, link_raw, age_raw = tds[:5]

            # 마감된 공고(🔒) 제외
            if "\U0001f512" in link_raw:
                continue

            # 비자 스폰서 불가(🛂) 또는 미 시민권자 전용(🇺🇸) 또는 석박사 전용(🎓) 제외
            if "\U0001f6c2" in role_raw or "\U0001f1fa\U0001f1f8" in role_raw or "\U0001f393" in role_raw:
                continue

            comp = clean_html_text(comp_raw).replace("\U0001f525", "").strip()
            if comp in ("\u21b3", "") and last_company:
                comp = last_company
            else:
                last_company = comp

            role = clean_html_text(role_raw).replace("\U0001f525", "").strip()
            loc = clean_html_text(loc_raw)
            age_str = clean_html_text(age_raw)
            age_days = parse_age_days(age_str)

            # 비북미 지역 제외
            if NON_NA_LOC_PATTERN.search(loc):
                continue

            # 너무 오래된 공고(45일 초과)는 롤링 마감 가능성이 높으므로 후순위/제외
            if age_days > 45:
                continue

            # 지원 링크 추출
            m_url = re.search(r'href="([^"]+)"', link_raw)
            if not m_url:
                continue
            url = htmllib.unescape(m_url.group(1))
            url = re.sub(r"[?&](utm_source|utm_medium|ref)=Simplify[^&]*", "", url)

            is_ca = is_canada_location(loc)
            country = "CA" if is_ca else "US"

            # 보험계리/리스크 직무는 actuary 트랙으로 분류
            track = "actuary" if ACTUARY_ROLE_PATTERN.search(role) else base_track

            dedup_key = (comp.lower(), role.lower(), country)
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            # 등록일 및 예상 롤링 마감일 계산 (최소 기준일 +7일 보장)
            posted_date = base_date - timedelta(days=min(age_days, 45))
            rolling_deadline = max(base_date + timedelta(days=7), posted_date + timedelta(days=35))

            loc_display = loc if len(loc) <= 48 else loc[:45].rstrip(", ") + " 외"

            visa_label = (
                "Co-op Work Permit 지원 가능"
                if country == "CA"
                else "J-1 / F-1 비자 스폰서십 가능"
            )
            track_kor = {
                "quant": "퀀트 금융·트레이딩·리스크",
                "data_ai": "데이터 사이언스·AI·머신러닝",
                "software": "소프트웨어 엔지니어링",
                "actuary": "보험계리·리스크 모델링",
            }.get(track, "수학/테크 인턴십")

            summary = (
                f"[실시간 수집 · {age_str} 전 등록] {comp}의 {track_kor} 학부 인턴십/코옵 포지션 ({loc_display})."
            )

            collected.append({
                "company": comp,
                "title": role,
                "location": loc_display,
                "country": country,
                "track": track,
                "target_level": "Undergrad (Co-op / Summer Intern)",
                "hourly_rate": estimate_compensation(country, track, comp, role),
                "visa_sponsorship": visa_label,
                "source": f"SimplifyJobs Live ({age_str} ago)",
                "url": url,
                "posted_date": posted_date.isoformat(),
                "age_days": age_days,
                "age_label": age_str,
                "deadline": rolling_deadline.isoformat(),
                "tags": extract_tags(role, track, comp),
                "summary": summary,
            })

    return collected


def build_curated_postings(all_live_postings):
    """
    수집된 수백 건의 실시간 공고 중 워털루 수학과 학생에게 가장 중요한
    캐나다(CA) 코옵/인턴십 + 미국 퀀트/계리/AI/SW 공고 상위 30건을 균형 있게 선별합니다.
    """
    sorted_live = sorted(all_live_postings, key=lambda x: x.get("age_days", 999))

    ca_jobs = [j for j in sorted_live if j["country"] == "CA"]
    quant_jobs = [j for j in sorted_live if j["track"] == "quant" and j["country"] == "US"]
    actuary_jobs = [j for j in sorted_live if j["track"] == "actuary"]
    data_jobs = [j for j in sorted_live if j["track"] == "data_ai" and j["country"] == "US"]
    swe_jobs = [j for j in sorted_live if j["track"] == "software" and j["country"] == "US"]

    selected = []
    seen = set()
    company_counts = {}

    def add_slice(items, max_count, max_per_company=1):
        count = 0
        for item in items:
            comp_key = item["company"].lower()
            key = (comp_key, item["title"].lower())
            if key in seen:
                continue
            if company_counts.get(comp_key, 0) >= max_per_company:
                continue
            seen.add(key)
            company_counts[comp_key] = company_counts.get(comp_key, 0) + 1
            selected.append(item)
            count += 1
            if count >= max_count:
                break

    add_slice(ca_jobs, 10, max_per_company=1)
    add_slice(quant_jobs, 6, max_per_company=1)
    add_slice(actuary_jobs, 4, max_per_company=1)
    add_slice(data_jobs, 5, max_per_company=1)
    add_slice(swe_jobs, 5, max_per_company=1)

    for idx, item in enumerate(selected, 1):
        item["id"] = f"live-{idx:02d}"

    return selected, {
        "total_open_na_roles": len(all_live_postings),
        "canada_open_roles": len(ca_jobs),
        "quant_open_roles": len([j for j in all_live_postings if j["track"] == "quant"]),
        "data_ai_open_roles": len([j for j in all_live_postings if j["track"] == "data_ai"]),
        "software_open_roles": len([j for j in all_live_postings if j["track"] == "software"]),
        "actuary_open_roles": len(actuary_jobs),
    }


def get_official_waterloo_coop_schedule():
    """
    워털루 대학교 수학과 1학년(2026–2027) → 2028년 첫 공식 Co-op(Sequence 3 / Winter·Spring 2028 WT1) 타깃
    공식 학사·비자·조기 인턴십 및 2028 코옵 마일스톤 전체 일정
    """
    return [
        {
            "id": "uw_f26_c3_interview",
            "title": "[코옵 동향] WaterlooWorks Fall Cycle 3 면접 주간 (선배 매칭 트렌드 참고)",
            "due_date": "2026-11-17",
            "urgency": "medium",
            "category": "WaterlooWorks",
            "phase_group": "short_term",
        },
        {
            "id": "ircc_coop_work_permit",
            "title": "[비자 필수] 캐나다 유학생 Co-op Work Permit 서류 점검 및 조기 신청 권장",
            "due_date": "2026-11-20",
            "urgency": "high",
            "category": "Visa",
            "phase_group": "short_term",
        },
        {
            "id": "uw_f26_classes_end",
            "title": "[1A 학사] 2026 가을학기(1A) 정규 수업 종강",
            "due_date": "2026-12-08",
            "urgency": "high",
            "category": "Academic",
            "phase_group": "short_term",
        },
        {
            "id": "uw_f26_exams_start",
            "title": "[1A 학사] 2026 가을학기(1A) 기말고사 시작 (12/10~12/22 · 1학년 GPA 핵심)",
            "due_date": "2026-12-10",
            "urgency": "high",
            "category": "Academic",
            "phase_group": "short_term",
        },
        {
            "id": "uw_w27_c1a_benchmark",
            "title": "[사전 벤치마크] WaterlooWorks Winter Cycle 1 오픈 (2028 지원 대비 직무·스펙 분석)",
            "due_date": "2027-01-09",
            "urgency": "medium",
            "category": "WaterlooWorks",
            "phase_group": "short_term",
        },
        {
            "id": "uw_w27_classes_start",
            "title": "[1B 학사] 2027 겨울학기(1B) 개강 (CS 136 · MATH 136/138 시작)",
            "due_date": "2027-01-11",
            "urgency": "high",
            "category": "Academic",
            "phase_group": "short_term",
        },
        {
            "id": "na_discovery_programs",
            "title": "[1학년 조기프로그램] 북미 빅테크·퀀트 Freshmen Discovery (STEP·FTTP 등) 주요 마감",
            "due_date": "2027-01-31",
            "urgency": "high",
            "category": "Early Talent",
            "phase_group": "short_term",
        },
        {
            "id": "uw_w27_exams_period",
            "title": "[1B 학사] 2027 겨울학기(1B) 기말고사 돌입 및 1학년 성적 확정",
            "due_date": "2027-04-09",
            "urgency": "medium",
            "category": "Academic",
            "phase_group": "short_term",
        },
        {
            "id": "bridge_summer_2027",
            "title": "[골든타임] 2027 봄/여름 브릿지 텀 시작 (외부 인턴십·URA 연구·SOA P/FM·포트폴리오)",
            "due_date": "2027-05-10",
            "urgency": "medium",
            "category": "Bridge 2027",
            "phase_group": "short_term",
        },
        {
            "id": "early_bird_2028_quant_tech",
            "title": "[2028 외부공채] 북미 퀀트 헤지펀드·빅테크 2028 인턴십 외부 Early Bird 오픈",
            "due_date": "2027-07-15",
            "urgency": "high",
            "category": "2028 Co-op Target",
            "phase_group": "target_2028",
        },
        {
            "id": "uw_f27_2a_pd1_start",
            "title": "[2A 개강/필수] 2027 가을학기(2A) 개강 & PD1(Career Fundamentals) 수강 시작",
            "due_date": "2027-09-08",
            "urgency": "high",
            "category": "2028 Co-op Target",
            "phase_group": "target_2028",
        },
        {
            "id": "uw_f27_ww_c1_open",
            "title": "[2028 첫 코옵] WaterlooWorks Fall Cycle 1 공고 오픈 — Winter 2028 WT1 본 지원 (예상일)",
            "due_date": "2027-09-18",
            "urgency": "high",
            "category": "2028 Co-op Target",
            "phase_group": "target_2028",
        },
        {
            "id": "uw_f27_ww_c1_interview_match",
            "title": "[2028 첫 코옵] WaterlooWorks Fall Cycle 1 본 면접 & 1차 랭킹 매칭 시즌 (예상일)",
            "due_date": "2027-10-15",
            "urgency": "high",
            "category": "2028 Co-op Target",
            "phase_group": "target_2028",
        },
        {
            "id": "uw_w28_wt1_start",
            "title": "[🎯 목표 달성] 2028 겨울학기(Winter 2028) 대망의 첫 공식 Co-op (Work Term 1) 출근!",
            "due_date": "2028-01-10",
            "urgency": "high",
            "category": "2028 Co-op Target",
            "phase_group": "target_2028",
        },
        {
            "id": "uw_s28_wt1_alt_start",
            "title": "[🎯 Spring 시퀀스] 2028 봄학기(Spring 2028) 첫 Co-op 시작 (Spring WT1 시퀀스 선택 시)",
            "due_date": "2028-05-08",
            "urgency": "medium",
            "category": "2028 Co-op Target",
            "phase_group": "target_2028",
        },
    ]


def verify_uw_dates_page():
    """워털루 공식 학사 일정 웹페이지 접속 가능 여부를 확인합니다."""
    try:
        req = urllib.request.Request(UW_IMPORTANT_DATES_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            return resp.status == 200 and "important dates" in html.lower()
    except Exception:
        return False


def filter_expired_existing_postings(base_date):
    """네트워크 실패 시에도 기존 저장된 공고 중 마감일이 지난 항목을 정리합니다."""
    if not os.path.exists(POSTINGS_PATH):
        return []
    try:
        with open(POSTINGS_PATH, "r", encoding="utf-8") as f:
            existing = json.load(f)
        valid = []
        for p in existing:
            try:
                dl = datetime.strptime(str(p.get("deadline", "")), "%Y-%m-%d").date()
                if dl >= base_date:
                    valid.append(p)
            except Exception:
                valid.append(p)
        if len(valid) != len(existing):
            with open(POSTINGS_PATH, "w", encoding="utf-8") as f:
                json.dump(valid, f, ensure_ascii=False, indent=2)
        return valid
    except Exception:
        return []


def sync_all_data():
    """
    1. 실시간 북미 인턴십/코옵 공고를 수집하여 data/internship_postings.json 업데이트
    2. 워털루 수학과 1학년(2028 첫 코옵 타깃) 전체 일정을 data/waterloo_math_profile.json 에 동기화
    """
    now_kst = datetime.now(KST)
    print(
        f"🔄 [LIVE CRAWLER] 실시간 북미 인턴십 & 워털루 2028 코옵 일정 동기화 시작 "
        f"({now_kst.strftime('%Y-%m-%d %H:%M:%S')} KST)"
    )

    stats = {}
    curated_count = 0
    try:
        all_live = fetch_live_simplify_postings(now_kst.date())
        curated_postings, stats = build_curated_postings(all_live)
        if curated_postings:
            with open(POSTINGS_PATH, "w", encoding="utf-8") as f:
                json.dump(curated_postings, f, ensure_ascii=False, indent=2)
            curated_count = len(curated_postings)
            print(
                f"✅ [LIVE POSTINGS] 총 {stats['total_open_na_roles']}건의 북미 오픈 공고 중 "
                f"워털루 수학과 맞춤 {curated_count}건(🇨🇦 캐나다 {stats['canada_open_roles']}건 탐색) 저장 완료!"
            )
    except Exception as e:
        print(f"⚠️ [LIVE POSTINGS WARNING] 실시간 피드 연결 실패, 기존 저장 공고 정리 유지: {e}")
        valid = filter_expired_existing_postings(now_kst.date())
        curated_count = len(valid)

    uw_verified = verify_uw_dates_page()
    if os.path.exists(PROFILE_PATH):
        with open(PROFILE_PATH, "r", encoding="utf-8") as f:
            profile = json.load(f)
    else:
        profile = {}

    prev_stats = profile.get("live_sync_metadata", {}).get("live_jobs_stats", {})
    profile["d_day_alerts"] = get_official_waterloo_coop_schedule()
    profile["live_sync_metadata"] = {
        "last_synced_kst": now_kst.strftime("%Y-%m-%d %H:%M:%S KST"),
        "uw_official_dates_url": UW_IMPORTANT_DATES_URL,
        "uw_official_page_verified": uw_verified,
        "live_jobs_source_url": SIMPLIFY_README_URL,
        "live_jobs_stats": stats if stats else prev_stats,
    }

    with open(PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

    # 오프라인 더블클릭(file://) 폴백 스냅샷 자동 갱신
    try:
        if os.path.exists(CORE_JS_PATH) and os.path.exists(POSTINGS_PATH) and os.path.exists(RESOURCES_PATH):
            with open(POSTINGS_PATH, "r", encoding="utf-8") as fp:
                postings_snap = json.load(fp)
            with open(RESOURCES_PATH, "r", encoding="utf-8") as fr:
                resources_snap = json.load(fr)
            with open(CORE_JS_PATH, "r", encoding="utf-8") as fc:
                js_src = fc.read()
            snap_payload = json.dumps(
                {"profile": profile, "postings": postings_snap, "resources": resources_snap},
                ensure_ascii=False,
            )
            replacement = (
                "/* __OFFLINE_SNAPSHOT_START__ */\n"
                f"  const OFFLINE_SNAPSHOT = {snap_payload};\n"
                "  /* __OFFLINE_SNAPSHOT_END__ */"
            )
            new_js, n_sub = re.subn(
                r"/\* __OFFLINE_SNAPSHOT_START__ \*/.*?/\* __OFFLINE_SNAPSHOT_END__ \*/",
                lambda _: replacement,
                js_src,
                flags=re.DOTALL,
            )
            if n_sub > 0:
                with open(CORE_JS_PATH, "w", encoding="utf-8") as fc:
                    fc.write(new_js)
    except Exception as snap_err:
        print(f"⚠️ [SNAPSHOT INFO] uw-core.js 스냅샷 동기화 건너뜀: {snap_err}")

    print(f"✅ [OFFICIAL SCHEDULE] 워털루 2028 코옵 타깃 학사·채용 일정 {len(profile['d_day_alerts'])}건 동기화 완료!")
    return {
        "success": True,
        "synced_at": now_kst.strftime("%Y-%m-%d %H:%M:%S KST"),
        "uw_verified": uw_verified,
        "schedule_count": len(profile["d_day_alerts"]),
        "postings_count": curated_count,
        "stats": profile["live_sync_metadata"]["live_jobs_stats"],
    }


if __name__ == "__main__":
    sync_all_data()
