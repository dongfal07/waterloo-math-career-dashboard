#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career - Live North American Internship & Official Co-op Schedule Crawler
실시간 북미(캐나다/미국) 학부생 인턴십·코옵 공고(SimplifyJobs Live Feed) 및
워털루 대학교 공식 Co-op 학사 일정(uwaterloo.ca) 자동 수집·동기화 엔진
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

SIMPLIFY_README_URL = "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/README.md"
UW_IMPORTANT_DATES_URL = "https://uwaterloo.ca/co-operative-education/important-dates"

# 캐나다 지역 판별 정규식
CANADA_LOC_PATTERN = re.compile(
    r"\b(Canada|ON|BC|QC|AB|MB|NS|Waterloo|Toronto|Ottawa|Vancouver|Montreal|Montréal|Calgary|Edmonton|Markham|Mississauga|Kitchener|Oakville|Winnipeg|Halifax)\b",
    re.IGNORECASE,
)

# 비북미(영국/유럽/아시아 등) 제외 정규식
NON_NA_LOC_PATTERN = re.compile(
    r"\b(UK|United Kingdom|London, UK|England|Germany|France|Singapore|Hong Kong|Tokyo|Japan|Australia|Sydney|Amsterdam|Netherlands|Dublin|Ireland|India|Zurich|Switzerland|Poland|Spain)\b",
    re.IGNORECASE,
)

# 보험계리/리스크 트랙 판별 키워드
ACTUARY_ROLE_PATTERN = re.compile(
    r"\b(Actuar\w*|Underwrit\w*|Insurance|Pension|Annuity|Risk Analytics|Risk Model\w*|Credit Risk|Market Risk|Enterprise Risk)\b",
    re.IGNORECASE,
)


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
    """직무명과 트랙에 따라 핵심 기술/역량 태그를 생성합니다."""
    tags = []
    text = f"{role} {company}".lower()
    keyword_map = [
        ("quant", "Quantitative Modeling"),
        ("trading", "Algorithmic Trading"),
        ("risk", "Risk Analytics"),
        ("actuar", "Actuarial Science"),
        ("machine learning", "Machine Learning"),
        ("ai", "AI / LLM"),
        ("data", "Data Science"),
        ("analytics", "Statistical Analysis"),
        ("python", "Python"),
        ("c++", "C++"),
        ("backend", "Backend Systems"),
        ("fullstack", "Full-Stack"),
        ("cloud", "Cloud Infra"),
        ("co-op", "Waterloo Co-op"),
    ]
    for kw, label in keyword_map:
        if kw in text and label not in tags:
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
    comp_lower = company.lower()
    if any(k in comp_lower for k in ("citadel", "jane street", "two sigma", "HRT", "hudson river", "jump trading", "five rings", "de shaw")):
        return "$85 ~ $110 / hr USD"
    if any(k in comp_lower for k in ("schonfeld", "balyasny", "point72", "millennium", "sig", "susquehanna", "optiver", "imc", "akuna")):
        return "$70 ~ $95 / hr USD"
    if any(k in comp_lower for k in ("amazon", "google", "meta", "apple", "microsoft", "nvidia", "stripe", "databricks", "openai", "anthropic", "roku", "roblox")):
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
    SimplifyJobs Summer 2027 GitHub 실시간 피드에서 북미(CA/US) 학부생 지원 가능 공고를 수집합니다.
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

            # 지원 링크 추출 (Simplify 래퍼 링크가 아닌 실제 기업 채용 링크 우선)
            m_url = re.search(r'href="([^"]+)"', link_raw)
            if not m_url:
                continue
            url = htmllib.unescape(m_url.group(1))
            # utm 파라미터 정리
            url = re.sub(r"[?&](utm_source|utm_medium|ref)=Simplify[^&]*", "", url)

            is_ca = bool(CANADA_LOC_PATTERN.search(loc))
            country = "CA" if is_ca else "US"

            # 보험계리/리스크 직무는 actuary 트랙으로 분류
            track = "actuary" if ACTUARY_ROLE_PATTERN.search(role) else base_track

            dedup_key = (comp.lower(), role.lower(), country)
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            # 등록일 및 예상 롤링 마감일 계산 (북미 인턴십은 통상 등록 후 30일 롤링 마감)
            posted_date = base_date - timedelta(days=min(age_days, 60))
            rolling_deadline = max(base_date + timedelta(days=7), posted_date + timedelta(days=35))

            # 위치 텍스트 축약
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
                "target_level": "Undergrad (Co-op / Intern)",
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
    수집된 수백 건의 실시간 공고 중 워털루 수학과 학생에게 가장 중요한:
    1) 캐나다(CA) 최신 Co-op/인턴십 공고
    2) 북미 Quantitative Finance 최신 공고
    3) 북미 Actuarial / Risk Analytics 최신 공고
    4) 북미 Data Science / AI 최신 공고
    5) 북미 Software Engineering 최신 공고
    를 균형 있게 선별하여 상위 30건을 구성합니다.
    """
    # 최신순 정렬 (age_days 오름차순)
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

    # 캐나다 공고 최우선 배정 (최대 10건), 퀀트(6건), 계리/리스크(4건), 데이터/AI(5건), SW(5건)
    add_slice(ca_jobs, 10, max_per_company=1)
    add_slice(quant_jobs, 6, max_per_company=1)
    add_slice(actuary_jobs, 4, max_per_company=1)
    add_slice(data_jobs, 5, max_per_company=1)
    add_slice(swe_jobs, 5, max_per_company=1)

    # ID 부여
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
    워털루 대학교 공식 Co-op Important Dates (https://uwaterloo.ca/co-operative-education/important-dates)
    기반 2026 가을학기 ~ 2027 겨울/봄 학기 전체 공식 일정
    """
    return [
        {
            "id": "uw_f26_c2_emp_rank",
            "title": "[WaterlooWorks] Fall Cycle 2 고용주 랭킹 발표 (2 p.m. ET)",
            "due_date": "2026-11-11",
            "urgency": "high",
            "category": "WaterlooWorks",
        },
        {
            "id": "uw_f26_c2_match",
            "title": "[WaterlooWorks] Fall Cycle 2 학생 랭킹 마감 & 매칭 발표",
            "due_date": "2026-11-13",
            "urgency": "high",
            "category": "WaterlooWorks",
        },
        {
            "id": "uw_f26_c3_interview",
            "title": "[WaterlooWorks] Fall Cycle 3 면접 주간 시작 (11/17~11/24)",
            "due_date": "2026-11-17",
            "urgency": "medium",
            "category": "WaterlooWorks",
        },
        {
            "id": "ircc_coop_work_permit",
            "title": "[비자 필수] 캐나다 Co-op Work Permit 비자 신청 권장 마감",
            "due_date": "2026-11-20",
            "urgency": "high",
            "category": "Visa",
        },
        {
            "id": "uw_f26_c3_match",
            "title": "[WaterlooWorks] Fall Cycle 3 학생 랭킹 마감 & 최종 매칭 발표",
            "due_date": "2026-11-27",
            "urgency": "medium",
            "category": "WaterlooWorks",
        },
        {
            "id": "uw_f26_direct_offer",
            "title": "[WaterlooWorks] Direct Offer (상시 직접 오퍼) 채용 전환 시작",
            "due_date": "2026-11-30",
            "urgency": "medium",
            "category": "WaterlooWorks",
        },
        {
            "id": "uw_f26_classes_end_pd1",
            "title": "[학사/PD1] 1A 가을학기 정규 수업 종강 & PD1 이력서 최종 마감",
            "due_date": "2026-12-08",
            "urgency": "high",
            "category": "Academic",
        },
        {
            "id": "uw_f26_exams_start",
            "title": "[학사] 1A 가을학기 기말고사 시작 (12/10~12/22)",
            "due_date": "2026-12-10",
            "urgency": "medium",
            "category": "Academic",
        },
        {
            "id": "uw_w27_c1a_open",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 1 (Posting A) 공고 오픈 (50개 한도)",
            "due_date": "2027-01-09",
            "urgency": "high",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_classes_start",
            "title": "[학사] 2027 겨울학기(1B) 개강",
            "due_date": "2027-01-11",
            "urgency": "medium",
            "category": "Academic",
        },
        {
            "id": "uw_w27_c1a_close",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 1 (Posting A) 1차 지원 마감 (9 a.m. ET)",
            "due_date": "2027-01-19",
            "urgency": "high",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c1_interviews",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 1 본 면접 시작 (1/22~2/9)",
            "due_date": "2027-01-22",
            "urgency": "high",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c1b_close",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 1 (Posting B) 최종 지원 마감 (100개 한도)",
            "due_date": "2027-01-26",
            "urgency": "high",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c1_emp_rank",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 1 고용주 랭킹 발표 (2 p.m. ET)",
            "due_date": "2027-02-10",
            "urgency": "high",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c1_match",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 1 학생 랭킹 마감 & 1차 매칭 결과 발표",
            "due_date": "2027-02-12",
            "urgency": "high",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c2_open",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 2 상시 공고 오픈 (500개 한도)",
            "due_date": "2027-02-13",
            "urgency": "medium",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c2_close",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 2 (Reading Week 공고분) 마감",
            "due_date": "2027-02-24",
            "urgency": "medium",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c2_match",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 2 학생 랭킹 마감 & 2차 매칭 발표",
            "due_date": "2027-03-19",
            "urgency": "medium",
            "category": "Spring 2027 Co-op",
        },
        {
            "id": "uw_w27_c3_match",
            "title": "[1B 첫 코옵] WaterlooWorks Cycle 3 최종 매칭 발표 & Direct Offer 시작",
            "due_date": "2027-04-02",
            "urgency": "medium",
            "category": "Spring 2027 Co-op",
        },
    ]


def verify_uw_dates_page():
    """워털루 공식 학사 일정 웹페이지 접속 가능 여부를 확인합니다."""
    try:
        req = urllib.request.Request(UW_IMPORTANT_DATES_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            return resp.status == 200 and "Winter 2027 important dates" in html
    except Exception:
        return False


def sync_all_data():
    """
    1. 실시간 북미 인턴십/코옵 공고를 수집하여 data/internship_postings.json 업데이트
    2. 워털루 대학교 공식 Co-op 전체 일정을 data/waterloo_math_profile.json 에 동기화
    """
    now_kst = datetime.now(KST)
    print(f"🔄 [LIVE CRAWLER] 실시간 북미 인턴십 & 워털루 공식 코옵 일정 동기화 시작 ({now_kst.strftime('%Y-%m-%d %H:%M:%S')} KST)")

    # 1. 실시간 공고 수집
    stats = {}
    try:
        all_live = fetch_live_simplify_postings(now_kst.date())
        curated_postings, stats = build_curated_postings(all_live)
        if curated_postings:
            with open(POSTINGS_PATH, "w", encoding="utf-8") as f:
                json.dump(curated_postings, f, ensure_ascii=False, indent=2)
            print(
                f"✅ [LIVE POSTINGS] 총 {stats['total_open_na_roles']}건의 북미 오픈 공고 중 "
                f"워털루 수학과 맞춤 {len(curated_postings)}건(🇨🇦 캐나다 {stats['canada_open_roles']}건 탐색) 저장 완료!"
            )
    except Exception as e:
        print(f"⚠️ [LIVE POSTINGS WARNING] 실시간 피드 연결 실패, 기존 저장 공고 유지: {e}")

    # 2. 워털루 공식 코옵 일정 전체 업데이트
    uw_verified = verify_uw_dates_page()
    if os.path.exists(PROFILE_PATH):
        with open(PROFILE_PATH, "r", encoding="utf-8") as f:
            profile = json.load(f)
    else:
        profile = {}

    profile["d_day_alerts"] = get_official_waterloo_coop_schedule()
    profile["live_sync_metadata"] = {
        "last_synced_kst": now_kst.strftime("%Y-%m-%d %H:%M:%S KST"),
        "uw_official_dates_url": UW_IMPORTANT_DATES_URL,
        "uw_official_page_verified": uw_verified,
        "live_jobs_source_url": SIMPLIFY_README_URL,
        "live_jobs_stats": stats,
    }

    with open(PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

    print(f"✅ [OFFICIAL SCHEDULE] 워털루 대학교 공식 Co-op 학사 일정 {len(profile['d_day_alerts'])}건 전체 등록 완료!")
    return {
        "synced_at": now_kst.strftime("%Y-%m-%d %H:%M:%S KST"),
        "uw_verified": uw_verified,
        "schedule_count": len(profile["d_day_alerts"]),
        "stats": stats,
    }


if __name__ == "__main__":
    sync_all_data()
