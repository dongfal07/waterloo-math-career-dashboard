/**
 * Waterloo Faculty of Mathematics Career Intelligence — Shared Core Engine v2.0
 * Works identically across GitHub Pages (https://), Local Python Server (http://localhost:8080),
 * and Offline Double-Click (file://).
 */
(function (window) {
  'use strict';

  const CLOUD_URL = 'https://dongfal07.github.io/waterloo-math-career-dashboard/';
  const DEFAULT_KAKAO_JS_KEY = 'd8dd99b5dce9a95e6702730ea00159e9';

  const STORAGE_KEYS = {
    BOOKMARKS: 'UW_MATH_BOOKMARKS_V2',
    APPLIED: 'UW_MATH_APPLIED_V2',
    CHECKLIST: 'UW_MATH_CHECKLIST_V2',
    CUSTOM_TODOS: 'UW_MATH_CUSTOM_TODOS_V2',
    KAKAO_KEY: 'UW_KAKAO_JS_KEY'
  };

  /* __OFFLINE_SNAPSHOT_START__ */
  const OFFLINE_SNAPSHOT = {"profile": {"student": {"university": "University of Waterloo", "faculty": "Faculty of Mathematics", "program": "Honours Mathematics (Co-op)", "year": "1st Year (1A/1B · 2026–2027)", "coop_sequence": "Sequence 3 · 2028 첫 공식 Co-op 타깃", "first_coop_start_date": "2028-01-10", "bridge_term": "Spring/Summer 2027 (Off-Term 대외 인턴십 · URA 학부연구 · 자격시험 골든타임)", "target_terms": ["Winter 2028 (Work Term 1)", "Spring 2028 (Work Term 1)"], "career_tracks": [{"id": "quant", "name": "Quantitative Finance & Trading", "kor_name": "퀀트 금융 · 트레이딩", "description": "확률미적분·선형대수·통계적 차익거래 모델링, 알고리즘 마켓메이킹 및 파생상품 리스크 관리", "target_majors": ["Mathematical Finance", "Combinatorics & Optimization (C&O)", "Statistics", "FARM"], "first_year_courses": ["MATH 135/136 (Honours Algebra)", "MATH 137/138 (Calculus)", "CS 135/136", "STAT 230 (1B 조기이수 권장)"], "recommended_skills": ["Python (NumPy, Pandas)", "C++ (Low-Latency)", "Probability & Mental Math", "Stochastic Modeling", "Backtesting"], "top_employers": ["Citadel", "Jane Street", "Two Sigma", "CPP Investments", "BMO Capital Markets", "Point72"]}, {"id": "data_ai", "name": "Data Science & Machine Learning", "kor_name": "데이터 사이언스 · AI", "description": "대규모 데이터 파이프라인 구축, 머신러닝·딥러닝 모델 학습 및 예측 의사결정 엔지니어링", "target_majors": ["Data Science (BMath/BCS)", "Statistics", "Computational Mathematics"], "first_year_courses": ["CS 135/136", "MATH 136 (Linear Algebra)", "STAT 230/231"], "recommended_skills": ["Python", "SQL", "PyTorch / Scikit-Learn", "LLM & RAG Pipeline", "Statistical Inference"], "top_employers": ["Shopify", "Qualcomm", "Wealthsimple", "RBC Borealis AI", "Amazon", "Sun Life"]}, {"id": "software", "name": "Software Engineering & Systems", "kor_name": "소프트웨어 · 알고리즘 개발", "description": "분산 백엔드 인프라, 초저지연 트레이딩 시스템, 클라우드 플랫폼 및 풀스택 제품 엔지니어링", "target_majors": ["Computer Science / BMath CS", "Combinatorics & Optimization", "Applied Mathematics"], "first_year_courses": ["CS 135 (Functional)", "CS 136 (C & Memory/Systems)", "MATH 135"], "recommended_skills": ["C / C++", "Python / TypeScript", "Data Structures & Algorithms", "Linux & Git", "Distributed Systems"], "top_employers": ["Google (Waterloo/Kitchener)", "Shopify", "Amazon", "Bloomberg", "Royal Bank of Canada", "1Password"]}, {"id": "actuary", "name": "Actuarial Science & Risk Management", "kor_name": "보험계리 · 리스크 모델링", "description": "생명·손해보험 수리 모델링, 연금 부채 평가(ALM), 신용·시장 리스크 계량화 및 파생상품 평가", "target_majors": ["Actuarial Science", "FARM (Financial Analysis & Risk Management)", "Statistics"], "first_year_courses": ["MATH 137/138", "AFM 101 / ECON 101", "ACTSC 221 / STAT 230"], "recommended_skills": ["SOA Exam P / FM 합격", "R / Python", "Excel (VBA) & SQL", "Risk & Loss Modeling", "Financial Mathematics"], "top_employers": ["Manulife", "Sun Life Financial", "Munich Re", "Intact Financial", "AXA", "Oliver Wyman"]}]}, "coop_statistics": {"faculty_name": "Faculty of Mathematics Co-op", "employment_rate": "96.4%", "average_hourly_earnings_cad": {"Work Term 1": 23.4, "Work Term 2": 26.85, "Work Term 3": 30.2, "Work Term 4": 34.5, "Work Term 5": 38.8, "Work Term 6": 43.1}, "regional_distribution": {"Ontario (Waterloo / Toronto / Ottawa)": 62, "United States (NYC / Bay Area / Seattle / Chicago)": 24, "Other Canada (Vancouver / Montreal / Calgary)": 11, "International (London / Europe / Asia)": 3}, "faculty_breakdown_percentages": {"Tech & Software": 42, "Finance, Quant & Banking": 28, "Insurance & Actuarial": 14, "Data, Consulting & Research": 11, "Government & Policy": 5}}, "default_checklist": [{"id": "chk_gpa_1a", "phase": "1A/1B 학사", "text": "1A 핵심 전공(MATH 135 · MATH 137 · CS 135) 학점 85%+ 목표로 관리하기", "default_done": true}, {"id": "chk_cwp_visa", "phase": "비자 필수", "text": "캐나다 Co-op Work Permit(코옵 워크퍼밋) 발급 요건 및 필요 서류 확인", "default_done": true}, {"id": "chk_github_proj", "phase": "포트폴리오", "text": "수학 모델링·데이터 분석·개발 사이드 프로젝트 1개 GitHub 공개 배포", "default_done": false}, {"id": "chk_discovery_2027", "phase": "1학년 조기지원", "text": "1학년 대상 Discovery 프로그램(Google STEP, Jane Street FTTP 등) 지원 리스트업", "default_done": false}, {"id": "chk_stat_cs136", "phase": "1B 수강전략", "text": "1B 학기 CS 136(C언어/시스템) 및 STAT 230(확률론) 수강으로 2028 면접 기반 확보", "default_done": false}, {"id": "chk_summer27_bridge", "phase": "2027 여름방학", "text": "2027 여름 Off-Term 계획 수립 (외부 인턴 / 학부연구 URA / SOA Exam P·LeetCode 150)", "default_done": false}, {"id": "chk_resume_cca", "phase": "2027 가을 2A", "text": "2A 학기 PD1 수강 및 워털루 CCA 1:1 영문 레쥬메 크리틱 완료 후 WaterlooWorks 출격", "default_done": false}], "waterloo_coop_timeline": [{"step": 1, "phase": "Phase 1 · 1A/1B Term (2026.09 ~ 2027.04)", "title": "전공 기초 GPA 확보 & 1학년 조기 프로그램 탐색", "description": "2028 첫 코옵에서는 1학년 성적표(MATH 135/136, CS 135/136)가 가장 강력한 서류 평가 지표가 됩니다.", "action_items": ["1A/1B 수학·CS 핵심 과목 고학점 확보 및 세부전공(FARM/Data/C&O/ActSci) 탐색", "캐나다 Co-op Work Permit 비자 선제 점검 및 1학년 Discovery 캠프 지원", "워털루 학회(MathSoc, CSC, DSC, WatStreet 퀀트 클럽) 활동 참여"], "status": "In Progress"}, {"step": 2, "phase": "Phase 2 · Summer Bridge (2027.05 ~ 2027.08)", "title": "2028 첫 코옵 승부처: 스펙 도약 골든타임", "description": "Sequence 3(2028 첫 코옵)의 최대 강점은 본 코옵 지원 전 여름방학 4개월을 온전히 실전 스펙업에 쓸 수 있다는 점입니다.", "action_items": ["외부 서머 인턴십, 워털루 학부 연구생(URA/MURA), 또는 실전 퀀트·AI 프로젝트 완주", "계리/금융 트랙: SOA Exam P 또는 FM 합격 | SW/퀀트: LeetCode 150 & 확률 인터뷰 대비", "2027년 7~8월 오픈하는 미국/캐나다 2028 인턴십 외부 조기공채(Early Bird) 선지원"], "status": "Upcoming"}, {"step": 3, "phase": "Phase 3 · 2A Term 리크루팅 (2027.09 ~ 2027.12)", "title": "PD1 이수 & WaterlooWorks 본 라운드 총력전", "description": "2027 가을학기(2A) 개강과 함께 WaterlooWorks Cycle 1(50+100개 한도)에서 2028 첫 코옵 오퍼를 확정합니다.", "action_items": ["PD1(Career Fundamentals) 필수 모듈 완수 및 CCA 1:1 레쥬메/모의면접 피드백 반영", "WaterlooWorks Cycle 1 집중 타깃팅 및 Tatham Centre(TC)/화상 기술면접 진행", "WaterlooWorks 상호 랭킹 알고리즘 전략 수립 (Spring 2028 시퀀스는 2028.01 진행)"], "status": "Upcoming"}, {"step": 4, "phase": "Phase 4 · Work Term 1 (2028 Winter / Spring)", "title": "2028년 대망의 첫 공식 Co-op 근무 & 커리어 점프", "description": "첫 4개월 유급 풀타임 인턴십을 수행하며 학점 인정(PD11)과 차기 미국/상위 티어 코옵 발판을 확보합니다.", "action_items": ["고용주 최종 근무평가(Work Term Evaluation) Outstanding / Excellent 등급 달성", "팀 시니어 엔지니어·퀀트 멘토링 네트워킹 및 리턴 오퍼 / 추천서 확보"], "status": "Target 2028"}], "d_day_alerts": [{"id": "uw_f26_c3_interview", "title": "[코옵 동향] WaterlooWorks Fall Cycle 3 면접 주간 (선배 매칭 트렌드 참고)", "due_date": "2026-11-17", "urgency": "medium", "category": "WaterlooWorks", "phase_group": "short_term"}, {"id": "ircc_coop_work_permit", "title": "[비자 필수] 캐나다 유학생 Co-op Work Permit 서류 점검 및 조기 신청 권장", "due_date": "2026-11-20", "urgency": "high", "category": "Visa", "phase_group": "short_term"}, {"id": "uw_f26_classes_end", "title": "[1A 학사] 2026 가을학기(1A) 정규 수업 종강", "due_date": "2026-12-08", "urgency": "high", "category": "Academic", "phase_group": "short_term"}, {"id": "uw_f26_exams_start", "title": "[1A 학사] 2026 가을학기(1A) 기말고사 시작 (12/10~12/22 · 1학년 GPA 핵심)", "due_date": "2026-12-10", "urgency": "high", "category": "Academic", "phase_group": "short_term"}, {"id": "uw_w27_c1a_benchmark", "title": "[사전 벤치마크] WaterlooWorks Winter Cycle 1 오픈 (2028 지원 대비 직무·스펙 분석)", "due_date": "2027-01-09", "urgency": "medium", "category": "WaterlooWorks", "phase_group": "short_term"}, {"id": "uw_w27_classes_start", "title": "[1B 학사] 2027 겨울학기(1B) 개강 (CS 136 · MATH 136/138 시작)", "due_date": "2027-01-11", "urgency": "high", "category": "Academic", "phase_group": "short_term"}, {"id": "na_discovery_programs", "title": "[1학년 조기프로그램] 북미 빅테크·퀀트 Freshmen Discovery (STEP·FTTP 등) 주요 마감", "due_date": "2027-01-31", "urgency": "high", "category": "Early Talent", "phase_group": "short_term"}, {"id": "uw_w27_exams_period", "title": "[1B 학사] 2027 겨울학기(1B) 기말고사 돌입 및 1학년 성적 확정", "due_date": "2027-04-09", "urgency": "medium", "category": "Academic", "phase_group": "short_term"}, {"id": "bridge_summer_2027", "title": "[골든타임] 2027 봄/여름 브릿지 텀 시작 (외부 인턴십·URA 연구·SOA P/FM·포트폴리오)", "due_date": "2027-05-10", "urgency": "medium", "category": "Bridge 2027", "phase_group": "short_term"}, {"id": "early_bird_2028_quant_tech", "title": "[2028 외부공채] 북미 퀀트 헤지펀드·빅테크 2028 인턴십 외부 Early Bird 오픈", "due_date": "2027-07-15", "urgency": "high", "category": "2028 Co-op Target", "phase_group": "target_2028"}, {"id": "uw_f27_2a_pd1_start", "title": "[2A 개강/필수] 2027 가을학기(2A) 개강 & PD1(Career Fundamentals) 수강 시작", "due_date": "2027-09-08", "urgency": "high", "category": "2028 Co-op Target", "phase_group": "target_2028"}, {"id": "uw_f27_ww_c1_open", "title": "[2028 첫 코옵] WaterlooWorks Fall Cycle 1 공고 오픈 — Winter 2028 WT1 본 지원 (예상일)", "due_date": "2027-09-18", "urgency": "high", "category": "2028 Co-op Target", "phase_group": "target_2028"}, {"id": "uw_f27_ww_c1_interview_match", "title": "[2028 첫 코옵] WaterlooWorks Fall Cycle 1 본 면접 & 1차 랭킹 매칭 시즌 (예상일)", "due_date": "2027-10-15", "urgency": "high", "category": "2028 Co-op Target", "phase_group": "target_2028"}, {"id": "uw_w28_wt1_start", "title": "[🎯 목표 달성] 2028 겨울학기(Winter 2028) 대망의 첫 공식 Co-op (Work Term 1) 출근!", "due_date": "2028-01-10", "urgency": "high", "category": "2028 Co-op Target", "phase_group": "target_2028"}, {"id": "uw_s28_wt1_alt_start", "title": "[🎯 Spring 시퀀스] 2028 봄학기(Spring 2028) 첫 Co-op 시작 (Spring WT1 시퀀스 선택 시)", "due_date": "2028-05-08", "urgency": "medium", "category": "2028 Co-op Target", "phase_group": "target_2028"}], "visa_guide": {"canada_coop": {"title": "캐나다 Co-op Work Permit (CWP)", "badge": "필수 · 무료 발급", "summary": "워털루 Co-op 재학생이 캐나다 내 기업에서 주 40시간 풀타임 유급 인턴십을 수행하기 위한 필수 허가서로, 학교 Co-op Letter로 IRCC에 수수료 없이 신청합니다.", "key_point": "2027년 가을 WaterlooWorks 본 지원 시작 전까지 반드시 승인본 수령을 완료하도록 1학년 중 미리 점검하세요."}, "us_internship_j1": {"title": "미국 인턴십 J-1 비자 (Exchange Visitor)", "badge": "고용주 전액 스폰서", "summary": "미국 빅테크(Google, Amazon 등) 및 퀀트 하우스(Citadel, Jane Street, Point72 등) 합격 시 기업 지정 스폰서(Cultural Vistas 등)가 DS-2019 발급을 지원합니다.", "key_point": "캐나다 시민권자는 국경에서 즉시 입국 심사 가능하며, 한국 국적 유학생은 토론토/밴쿠버 주재 미국 영사관 인터뷰를 통해 발급받습니다."}, "fulltime_pgwp_h1b": {"title": "졸업 후 북미 정착: 캐나다 PGWP vs 미국 STEM OPT · H-1B", "badge": "장기 커리어 전략", "summary": "캐나다는 워털루 졸업 즉시 최대 3년 오픈 워크퍼밋(PGWP)이 추첨 없이 보장되며, 미국은 STEM 전공 특례로 최대 36개월 OPT 근무 후 H-1B를 진행합니다.", "key_point": "코옵 6회(최대 2년 실무 경력)를 마치고 졸업하므로 신입 공채 및 영주권(Express Entry) 점수에서 압도적 우위를 가집니다."}}, "live_sync_metadata": {"last_synced_kst": "2026-11-16 12:01:50 KST", "uw_official_dates_url": "https://uwaterloo.ca/co-operative-education/important-dates", "uw_official_page_verified": true, "live_jobs_source_url": "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/README.md", "live_jobs_stats": {"total_open_na_roles": 682, "canada_open_roles": 46, "quant_open_roles": 16, "data_ai_open_roles": 345, "software_open_roles": 318, "actuary_open_roles": 3}}}, "postings": [{"company": "W.W. Grainger", "title": "GCAN Field Operations Analyst Intern", "location": "Thornhill, Vaughan, ON, Canada", "country": "CA", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$27 ~ $38 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (2d ago)", "url": "https://jobs.grainger.com/Canada/job/THORNHILL-GCAN-Field-Operations-Analyst-Intern-ON-L3T-7W8/1450732300/?ats=successfactors", "posted_date": "2026-11-14", "age_days": 2, "age_label": "2d", "deadline": "2026-12-19", "tags": ["Python", "SQL", "Machine Learning", "Statistics"], "summary": "[실시간 수집 · 2d 전 등록] W.W. Grainger의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Thornhill, Vaughan, ON, Canada).", "id": "live-01"}, {"company": "Capital Power", "title": "Student Intern - Data Science", "location": "Edmonton, AB, Canada", "country": "CA", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$27 ~ $38 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (4d ago)", "url": "https://capitalpower.wd10.myworkdayjobs.com/External/job/Edmonton-AB/Summer-Student---Data-Science_JR807223-1", "posted_date": "2026-11-12", "age_days": 4, "age_label": "4d", "deadline": "2026-12-17", "tags": ["Data Science", "Python", "SQL", "Machine Learning"], "summary": "[실시간 수집 · 4d 전 등록] Capital Power의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Edmonton, AB, Canada).", "id": "live-02"}, {"company": "exacare ai", "title": "Data and Analytics Intern", "location": "Toronto, ON, Canada", "country": "CA", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$27 ~ $38 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (4d ago)", "url": "https://ats.rippling.com/exacare-inc/jobs/e42f12bc-041a-4ef2-90d8-a77cd7f1f166", "posted_date": "2026-11-12", "age_days": 4, "age_label": "4d", "deadline": "2026-12-17", "tags": ["AI / LLM", "Data Science", "Statistical Analysis", "Python"], "summary": "[실시간 수집 · 4d 전 등록] exacare ai의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Toronto, ON, Canada).", "id": "live-03"}, {"company": "SOTI", "title": "Software Developer Intern", "location": "Mississauga, ON, Canada", "country": "CA", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$28 ~ $42 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (6d ago)", "url": "https://soti.wd3.myworkdayjobs.com/SOTI-Next-Gen/job/Mississauga-Canada--Meadowvale-Office-HQ/Software-Developer-Intern--May-2027---12-months-_R10677", "posted_date": "2026-11-10", "age_days": 6, "age_label": "6d", "deadline": "2026-12-15", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 6d 전 등록] SOTI의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (Mississauga, ON, Canada).", "id": "live-04"}, {"company": "PETRONAS Canada", "title": "Student Intern - Operation Advancement", "location": "Calgary, AB, Canada", "country": "CA", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$27 ~ $38 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (10d ago)", "url": "https://petronascanada.wd3.myworkdayjobs.com/PETRONASCanada/job/Calgary/Summer-Student--Operation-Advancement_R0001881", "posted_date": "2026-11-06", "age_days": 10, "age_label": "10d", "deadline": "2026-12-11", "tags": ["Python", "SQL", "Machine Learning", "Statistics"], "summary": "[실시간 수집 · 10d 전 등록] PETRONAS Canada의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Calgary, AB, Canada).", "id": "live-05"}, {"company": "Qualcomm", "title": "Machine Learning Engineering Intern", "location": "Markham, ON, Canada", "country": "CA", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$27 ~ $38 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (11d ago)", "url": "https://qualcomm.eightfold.ai/careers/job/446721969461", "posted_date": "2026-11-05", "age_days": 11, "age_label": "11d", "deadline": "2026-12-10", "tags": ["Machine Learning", "Python", "SQL", "Statistics"], "summary": "[실시간 수집 · 11d 전 등록] Qualcomm의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Markham, ON, Canada).", "id": "live-06"}, {"company": "Royal Bank of Canada", "title": "AI Engineer Co-op - Global Equities", "location": "Toronto, ON, Canada", "country": "CA", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$27 ~ $38 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (13d ago)", "url": "https://rbc.wd3.myworkdayjobs.com/rbcglobal1/job/TORONTO-Ontario-Canada/XMLNAME-2027-Capital-Markets--Global-Equities--AI-Engineer--16-Months--Co-op-_R-0000187401-2", "posted_date": "2026-11-03", "age_days": 13, "age_label": "13d", "deadline": "2026-12-08", "tags": ["AI / LLM", "Waterloo Co-op", "Python", "SQL"], "summary": "[실시간 수집 · 13d 전 등록] Royal Bank of Canada의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Toronto, ON, Canada).", "id": "live-07"}, {"company": "NVIDIA", "title": "Math Libraries Intern", "location": "Canada, Santa Clara, CA, United States", "country": "CA", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$45 ~ $65 / hr CAD", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (14d ago)", "url": "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite/job/US-CA-Santa-Clara/Math-Libraries-Intern--cuEST---Summer-2027_JR2028449", "posted_date": "2026-11-02", "age_days": 14, "age_label": "14d", "deadline": "2026-12-07", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 14d 전 등록] NVIDIA의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (Canada, Santa Clara, CA, United States).", "id": "live-08"}, {"company": "Bank of Montreal", "title": "Quantitative Trading Analyst Co-op", "location": "Toronto, ON, Canada", "country": "CA", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$30 ~ $45 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (18d ago)", "url": "https://bmo.wd3.myworkdayjobs.com/External/job/Toronto-ON-CAN/BMO-Capital-Markets-Quantitative-Trading-Analyst---12-16-Month-Co-op_R260029657", "posted_date": "2026-10-29", "age_days": 18, "age_label": "18d", "deadline": "2026-12-03", "tags": ["Quantitative Modeling", "Algorithmic Trading", "Waterloo Co-op", "Python"], "summary": "[실시간 수집 · 18d 전 등록] Bank of Montreal의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (Toronto, ON, Canada).", "id": "live-09"}, {"company": "Ryan", "title": "Software Engineer Intern", "location": "North York, ON, Canada", "country": "CA", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$28 ~ $42 / hr CAD (Co-op)", "visa_sponsorship": "Co-op Work Permit 지원 가능", "source": "SimplifyJobs Live (18d ago)", "url": "https://ryan.wd1.myworkdayjobs.com/RyanCareers/job/North-York/Summer-2027-Intern--Software-Engineering_R0020807-1", "posted_date": "2026-10-29", "age_days": 18, "age_label": "18d", "deadline": "2026-12-03", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 18d 전 등록] Ryan의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (North York, ON, Canada).", "id": "live-10"}, {"company": "StepStone Group", "title": "AI Quant Summer Analyst Intern", "location": "La Jolla, San Diego, CA", "country": "US", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$55 ~ $85 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (4d ago)", "url": "https://boards.greenhouse.io/embed/job_app?token=8368989", "posted_date": "2026-11-12", "age_days": 4, "age_label": "4d", "deadline": "2026-12-17", "tags": ["Quantitative Modeling", "AI / LLM", "Python", "Probability & Stats"], "summary": "[실시간 수집 · 4d 전 등록] StepStone Group의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (La Jolla, San Diego, CA).", "id": "live-11"}, {"company": "IMC Trading", "title": "Research Analyst Intern", "location": "Chicago, IL", "country": "US", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$70 ~ $95 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (11d ago)", "url": "https://job-boards.eu.greenhouse.io/imc/jobs/4823946101", "posted_date": "2026-11-05", "age_days": 11, "age_label": "11d", "deadline": "2026-12-10", "tags": ["Algorithmic Trading", "Python", "Probability & Stats", "Stochastic Modeling"], "summary": "[실시간 수집 · 11d 전 등록] IMC Trading의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (Chicago, IL).", "id": "live-12"}, {"company": "Schonfeld", "title": "DMFI Intern", "location": "NYC", "country": "US", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$70 ~ $95 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (18d ago)", "url": "https://job-boards.greenhouse.io/schonfeld/jobs/8324611", "posted_date": "2026-10-29", "age_days": 18, "age_label": "18d", "deadline": "2026-12-03", "tags": ["Python", "Probability & Stats", "Stochastic Modeling", "C++"], "summary": "[실시간 수집 · 18d 전 등록] Schonfeld의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (NYC).", "id": "live-13"}, {"company": "Arrowstreet Capital", "title": "Investment Processes Intern", "location": "Boston, MA", "country": "US", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$70 ~ $95 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (20d ago)", "url": "https://arrowstreetcapital.wd5.myworkdayjobs.com/Campus_Careers/job/Boston/Investment-Processes-Intern--Summer-2027_R1557", "posted_date": "2026-10-27", "age_days": 20, "age_label": "20d", "deadline": "2026-12-01", "tags": ["Python", "Probability & Stats", "Stochastic Modeling", "C++"], "summary": "[실시간 수집 · 20d 전 등록] Arrowstreet Capital의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (Boston, MA).", "id": "live-14"}, {"company": "Federal Home Loan Bank of Indianapolis", "title": "Model Risk Intern", "location": "Indianapolis, IN", "country": "US", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$55 ~ $85 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (21d ago)", "url": "https://fhlbi.wd1.myworkdayjobs.com/FHLBI_Careers/job/Indianapolis/Model-Risk-Intern_R636", "posted_date": "2026-10-26", "age_days": 21, "age_label": "21d", "deadline": "2026-11-30", "tags": ["Risk Analytics", "Python", "Probability & Stats", "Stochastic Modeling"], "summary": "[실시간 수집 · 21d 전 등록] Federal Home Loan Bank of Indianapolis의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (Indianapolis, IN).", "id": "live-15"}, {"company": "Glencore", "title": "Data Science Intern", "location": "NYC", "country": "US", "track": "quant", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$55 ~ $85 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (24d ago)", "url": "https://careers-ice.icims.com/jobs/14113/job?mobile=true&needsRedirect=false", "posted_date": "2026-10-23", "age_days": 24, "age_label": "24d", "deadline": "2026-11-27", "tags": ["Data Science", "Python", "Probability & Stats", "Stochastic Modeling"], "summary": "[실시간 수집 · 24d 전 등록] Glencore의 퀀트 금융·트레이딩·리스크 학부 인턴십/코옵 포지션 (NYC).", "id": "live-16"}, {"company": "State Farm", "title": "Property and Casualty Underwriting Intern - Knowledge Management", "location": "Richardson, TX, Bloomington, IL", "country": "US", "track": "actuary", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$30 ~ $45 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (3d ago)", "url": "https://jobs.statefarm.com/jobs/46442?icims=1&lang=en-us", "posted_date": "2026-11-13", "age_days": 3, "age_label": "3d", "deadline": "2026-12-18", "tags": ["SOA Exam P/FM", "Risk Modeling", "Excel / R", "Financial Math"], "summary": "[실시간 수집 · 3d 전 등록] State Farm의 보험계리·리스크 모델링 학부 인턴십/코옵 포지션 (Richardson, TX, Bloomington, IL).", "id": "live-17"}, {"company": "AXA", "title": "Underwriting Data & Analytics Intern", "location": "NYC", "country": "US", "track": "actuary", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$30 ~ $45 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (17d ago)", "url": "https://careers.axa.com/jobs/25498?icims=1", "posted_date": "2026-10-30", "age_days": 17, "age_label": "17d", "deadline": "2026-12-04", "tags": ["Data Science", "Statistical Analysis", "SOA Exam P/FM", "Risk Modeling"], "summary": "[실시간 수집 · 17d 전 등록] AXA의 보험계리·리스크 모델링 학부 인턴십/코옵 포지션 (NYC).", "id": "live-18"}, {"company": "Revantage Corporate Services", "title": "Insurance Technology & AI Analytics Intern", "location": "Dallas, TX, Chicago, IL", "country": "US", "track": "actuary", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$30 ~ $45 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (19d ago)", "url": "https://revantage.wd1.myworkdayjobs.com/Revantage/job/Chicago-IL/Insurance-Technology---AI-Analytics-Intern--Summer-2027_JR104539", "posted_date": "2026-10-28", "age_days": 19, "age_label": "19d", "deadline": "2026-12-02", "tags": ["AI / LLM", "Statistical Analysis", "SOA Exam P/FM", "Risk Modeling"], "summary": "[실시간 수집 · 19d 전 등록] Revantage Corporate Services의 보험계리·리스크 모델링 학부 인턴십/코옵 포지션 (Dallas, TX, Chicago, IL).", "id": "live-19"}, {"company": "Fanatics", "title": "People Intelligence Intern", "location": "NYC", "country": "US", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$38 ~ $55 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (0d ago)", "url": "https://job-boards.greenhouse.io/fanaticscollectibles/jobs/4505998009", "posted_date": "2026-11-16", "age_days": 0, "age_label": "0d", "deadline": "2026-12-21", "tags": ["Python", "SQL", "Machine Learning", "Statistics"], "summary": "[실시간 수집 · 0d 전 등록] Fanatics의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (NYC).", "id": "live-20"}, {"company": "Addepar", "title": "Product Analyst Intern", "location": "NYC", "country": "US", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$38 ~ $55 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (2d ago)", "url": "https://job-boards.greenhouse.io/addepar1/jobs/8910306002", "posted_date": "2026-11-14", "age_days": 2, "age_label": "2d", "deadline": "2026-12-19", "tags": ["Python", "SQL", "Machine Learning", "Statistics"], "summary": "[실시간 수집 · 2d 전 등록] Addepar의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (NYC).", "id": "live-21"}, {"company": "Verisk", "title": "Data Science/AI Intern", "location": "Lehi, UT", "country": "US", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$38 ~ $55 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (2d ago)", "url": "https://fa-ewmy-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/5184", "posted_date": "2026-11-14", "age_days": 2, "age_label": "2d", "deadline": "2026-12-19", "tags": ["AI / LLM", "Data Science", "Python", "SQL"], "summary": "[실시간 수집 · 2d 전 등록] Verisk의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Lehi, UT).", "id": "live-22"}, {"company": "Vertex Pharmaceuticals", "title": "Data Analytics Intern - OSD Process Data Analytics", "location": "Boston, MA", "country": "US", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$38 ~ $55 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (3d ago)", "url": "https://vrtx.wd501.myworkdayjobs.com/vertex_intern/job/Boston-MA/Summer-Intern-2027--OSD-Process-Data-Analytics_REQ-31312-2", "posted_date": "2026-11-13", "age_days": 3, "age_label": "3d", "deadline": "2026-12-18", "tags": ["Data Science", "Statistical Analysis", "Python", "SQL"], "summary": "[실시간 수집 · 3d 전 등록] Vertex Pharmaceuticals의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Boston, MA).", "id": "live-23"}, {"company": "The Toro Company", "title": "CX and Customer Lifetime Value Intern - Operations Analyst", "location": "Bloomington, MN", "country": "US", "track": "data_ai", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$38 ~ $55 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (3d ago)", "url": "https://ttc.wd1.myworkdayjobs.com/Toro_External_Careers/job/Bloomington-MN/CX-and-Customer-Lifetime-Value---Operations-Analyst---The-Toro-Company_JR17819", "posted_date": "2026-11-13", "age_days": 3, "age_label": "3d", "deadline": "2026-12-18", "tags": ["Python", "SQL", "Machine Learning", "Statistics"], "summary": "[실시간 수집 · 3d 전 등록] The Toro Company의 데이터 사이언스·AI·머신러닝 학부 인턴십/코옵 포지션 (Bloomington, MN).", "id": "live-24"}, {"company": "SAS", "title": "Software Developer Intern - Go/Golang Experience", "location": "Cary, NC", "country": "US", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$40 ~ $60 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (2d ago)", "url": "https://careers-sas.icims.com/jobs/42797/job?mobile=true&needsRedirect=false", "posted_date": "2026-11-14", "age_days": 2, "age_label": "2d", "deadline": "2026-12-19", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 2d 전 등록] SAS의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (Cary, NC).", "id": "live-25"}, {"company": "NextEra Energy", "title": "Software Engineering Intern - Technical", "location": "St Paul, MN", "country": "US", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$40 ~ $60 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (2d ago)", "url": "https://jobs.nexteraenergy.com/job/Juno-Beach-Summer-Intern-Technical-FL-33408/1450749000/?ats=successfactors", "posted_date": "2026-11-14", "age_days": 2, "age_label": "2d", "deadline": "2026-12-19", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 2d 전 등록] NextEra Energy의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (St Paul, MN).", "id": "live-26"}, {"company": "TC Energy", "title": "Intelligent Operations Technology Intern", "location": "Spokane, WA", "country": "US", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$40 ~ $60 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (3d ago)", "url": "https://tcenergy.wd3.myworkdayjobs.com/CAREER_SITE_TC/job/Spokane-Washington/Intern--Intelligent-Operations-Technology_JR-10919", "posted_date": "2026-11-13", "age_days": 3, "age_label": "3d", "deadline": "2026-12-18", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 3d 전 등록] TC Energy의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (Spokane, WA).", "id": "live-27"}, {"company": "RTX", "title": "Software Engineering Co-op", "location": "Richardson, TX", "country": "US", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$40 ~ $60 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (3d ago)", "url": "https://globalhr.wd5.myworkdayjobs.com/rec_rtx_ext_gateway/job/US-TX-RICHARDSON-C17--1717-Cityline-Dr--CITYLINE-C17/Software-Engineering-Co-op--Summer-Fall-_01884404", "posted_date": "2026-11-13", "age_days": 3, "age_label": "3d", "deadline": "2026-12-18", "tags": ["Waterloo Co-op", "Algorithms", "Python / C++", "Distributed Systems"], "summary": "[실시간 수집 · 3d 전 등록] RTX의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (Richardson, TX).", "id": "live-28"}, {"company": "Capital Group", "title": "Global Technology Summer Associate Intern", "location": "Irvine, CA", "country": "US", "track": "software", "target_level": "Undergrad (Co-op / Summer Intern)", "hourly_rate": "$40 ~ $60 / hr USD", "visa_sponsorship": "J-1 / F-1 비자 스폰서십 가능", "source": "SimplifyJobs Live (3d ago)", "url": "https://capgroup.wd1.myworkdayjobs.com/en-US/capitalgroupcareers/job/Irvine/CAMPUS-Global-Technology-Summer-Associate--2027-_JR7798", "posted_date": "2026-11-13", "age_days": 3, "age_label": "3d", "deadline": "2026-12-18", "tags": ["Algorithms", "Python / C++", "Distributed Systems", "Git"], "summary": "[실시간 수집 · 3d 전 등록] Capital Group의 소프트웨어 엔지니어링 학부 인턴십/코옵 포지션 (Irvine, CA).", "id": "live-29"}], "resources": {"categories": [{"id": "official_stats", "name": "1. 정부 및 공공 공식 통계 사이트", "description": "학교 자체 홍보가 아닌 연방 정부/통계청의 객관적 소득 및 부채 데이터", "resources": [{"name": "College Scorecard", "issuer": "미국 교육부 (U.S. Dept of Education)", "url": "https://collegescorecard.ed.gov/", "purpose": "미국 대학 및 수학/통계 전공별 졸업생 1~4년 차 실제 중위 소득(Median Earnings) 비교", "math_action": "미국 아이비리그 및 주요 주립대 수학/통계/CS 졸업생의 실제 초봉 및 부채 규모 확인"}, {"name": "Statistics Canada (Postsecondary Graduates)", "issuer": "캐나다 통계청 (StatCan)", "url": "https://www.statcan.gc.ca/", "purpose": "캐나다 공립 대학 전공별 취업률, 연간 중간 소득(Employment Income), 산업군별 분포", "math_action": "온타리오주 수학/컴퓨터 과학 졸업생의 캐나다 내 2년/5년 차 소득 궤적 파악"}, {"name": "College Navigator", "issuer": "미국 국립교육통계센터 (NCES)", "url": "https://nces.ed.gov/collegenavigator/", "purpose": "북미 대학별 기본 지표, 학위별 졸업률, 진학 연계 공식 통계", "math_action": "미국 대학원(Math PhD, Financial Engineering MS) 진학 시 타깃 학교 기본 통계 검증"}]}, {"id": "university_outcomes", "name": "2. 대학별 공식 Career Outcomes & Co-op 보고서", "description": "워털루 대학 및 북미 명문대 경력개발센터의 공식 취업 전수 조사", "resources": [{"name": "Waterloo Faculty of Math Co-op Earnings", "issuer": "University of Waterloo CCAO", "url": "https://uwaterloo.ca/co-operative-education/why-co-op/co-op-earnings", "purpose": "워털루 수학과 학기별(Work Term 1~6) 공식 평균 및 상위 시급 발표 자료", "math_action": "1학년 첫 코옵 지원 시 시급 협상 기준 및 기대 소득(평균 $23.40/hr) 점검"}, {"name": "WaterlooWorks", "issuer": "University of Waterloo", "url": "https://waterlooworks.uwaterloo.ca/", "purpose": "워털루 재학생 전용 코옵 공고 검색, 이력서 등록, 면접 예약 및 매칭 랭킹 시스템", "math_action": "매 학기 Main Round 및 Continuous Round 공고 상시 모니터링"}, {"name": "First Destination Reports (Top Universities)", "issuer": "MIT, CMU, Stanford Career Centers", "url": "https://capd.mit.edu/", "purpose": "수학/CS 학부 졸업생의 주요 취업 기업(Top Employers), 초봉, 지역 분포", "math_action": "북미 퀀트/빅테크 기업들의 선호 전공 및 초봉 벤치마크"}]}, {"id": "recruiting_platforms", "name": "3. 북미 대학생·신입 전용 채용 플랫폼", "description": "경력직 사이트와 차별화된 대학생 인턴십/엔트리 레벨 특화 플랫폼", "resources": [{"name": "Handshake", "issuer": "Handshake Inc.", "url": "https://joinhandshake.com/", "purpose": "북미 1,400개 대학 공식 연동, 캠퍼스 리크루팅 및 대학생 타깃 인턴 공고", "math_action": "워털루 계정으로 프로필 생성 후 빅테크/금융사 리크루터의 캠퍼스 이벤트 및 공고 접수"}, {"name": "RippleMatch", "issuer": "RippleMatch", "url": "https://ripplematch.com/", "purpose": "이력서 및 선호 직무(Quant, Data, Tech) 등록 시 AI 기반 신입/인턴 1:1 매칭", "math_action": "워털루 수학과 코옵과 병행하여 미국 원격/여름 인턴십 자동 매칭 수신"}, {"name": "WayUp", "issuer": "WayUp", "url": "https://www.wayup.com/", "purpose": "학부 1~2학년 대상 조기 인턴십(Underclassmen Discovery Programs) 및 서머 잡", "math_action": "골드만삭스, JP모건 등 글로벌 금융사의 1학년 대학생 조기 인재 발굴 프로그램 지원"}, {"name": "Magnet (캐나다 특화)", "issuer": "Toronto Metropolitan Univ & 캐나다 정부", "url": "https://magnet.today/", "purpose": "캐나다 청년/학생 고용 매칭 네트워크 및 연방/주정부 인턴십 지원금 연계", "math_action": "캐나다 국내 혁신 스타트업 및 정부 연구소 인턴십 탐색"}]}, {"id": "visa_h1b", "name": "4. 유학생 취업 및 비자 스폰서십 사이트", "description": "외국인 신분 인턴/신입 채용 비자 지원 이력 및 급여 검증", "resources": [{"name": "MyVisaJobs", "issuer": "MyVisaJobs Portal", "url": "https://www.myvisajobs.com/", "purpose": "미국 노동부(LCA) 기반 기업별 H-1B/영주권 스폰서십 승인 순위 및 직무별 급여", "math_action": "지원 대상 금융사/테크기업의 최근 외국인 비자 스폰서십 승인율 확인"}, {"name": "H1BGrader / H1Bdata.info", "issuer": "H1B Data Research", "url": "https://h1bgrader.com/", "purpose": "실제 H-1B 비자 승인 사례, 기본급(Base Salary), 직위별 데이터 검색", "math_action": "엔트리 레벨 퀀트 분석가/소프트웨어 엔지니어의 실제 비자 승인 연봉 확인"}, {"name": "GoinGlobal", "issuer": "GoinGlobal Portal", "url": "https://www.goinglobal.com/", "purpose": "국가별 취업 비자 규정 가이드, H-1B 후원 기업 상세 분석", "math_action": "미국/영국/캐나다 간 크로스보더 취업 비자 법률 요건 검토"}]}]}};
  /* __OFFLINE_SNAPSHOT_END__ */

  // ---------------------------------------------------------------------------
  // 1. KST Date & D-Day Calculation Engine
  // ---------------------------------------------------------------------------
  function todayKST() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function toDayNumber(ymd) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000 : NaN;
  }

  function calcDDay(dueYmd, baseYmd) {
    const base = baseYmd || todayKST();
    const diff = toDayNumber(dueYmd) - toDayNumber(base);
    if (Number.isNaN(diff)) return { days: null, label: 'D-?', isExpired: false, isUrgent: false };
    if (diff > 0) return { days: diff, label: `D-${diff}`, isExpired: false, isUrgent: diff <= 14 };
    if (diff === 0) return { days: 0, label: 'D-Day', isExpired: false, isUrgent: true };
    return { days: diff, label: `마감 D+${-diff}`, isExpired: true, isUrgent: false };
  }

  function updateAllDDayNodes() {
    const base = todayKST();
    document.querySelectorAll('[data-due-date]').forEach((el) => {
      const due = el.getAttribute('data-due-date');
      const info = calcDDay(due, base);
      el.textContent = info.label;
      el.title = `기준일 ${base} (KST) · 목표/마감일 ${due}`;
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Compensation Parser & Filtering / Sorting Helpers
  // ---------------------------------------------------------------------------
  function parsePayScore(hourlyRateStr) {
    const s = String(hourlyRateStr || '');
    const nums = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    if (!nums.length) return 0;
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const isUsd = /USD/i.test(s);
    return isUsd ? avg * 1.38 : avg; // CAD 환산 비교 점수
  }

  function getActivePostings(postings, baseYmd) {
    const base = baseYmd || todayKST();
    return (Array.isArray(postings) ? postings : []).filter((job) => {
      const d = calcDDay(job.deadline, base);
      return !d.isExpired;
    });
  }

  function getUpcomingAlerts(alerts, baseYmd) {
    const base = baseYmd || todayKST();
    return (Array.isArray(alerts) ? alerts : [])
      .map((a) => ({ ...a, dday: calcDDay(a.due_date, base) }))
      .filter((a) => !a.dday.isExpired)
      .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)));
  }

  function filterAndSortPostings(postings, opts = {}) {
    const {
      country = 'ALL',
      track = 'ALL',
      status = 'ALL', // ALL | BOOKMARKED | APPLIED
      query = '',
      sortBy = 'recent', // recent | deadline | pay
      includeExpired = false
    } = opts;

    const base = todayKST();
    const q = String(query || '').trim().toLowerCase();
    const bookmarks = getSet(STORAGE_KEYS.BOOKMARKS);
    const applied = getSet(STORAGE_KEYS.APPLIED);

    let list = (Array.isArray(postings) ? postings : []).map((j) => ({
      ...j,
      dday: calcDDay(j.deadline, base),
      payScore: parsePayScore(j.hourly_rate),
      isBookmarked: bookmarks.has(j.id),
      isApplied: applied.has(j.id)
    }));

    if (!includeExpired) {
      list = list.filter((j) => !j.dday.isExpired);
    }
    if (country !== 'ALL') {
      list = list.filter((j) => j.country === country);
    }
    if (track !== 'ALL') {
      list = list.filter((j) => j.track === track);
    }
    if (status === 'BOOKMARKED') {
      list = list.filter((j) => j.isBookmarked);
    } else if (status === 'APPLIED') {
      list = list.filter((j) => j.isApplied);
    }

    if (q) {
      list = list.filter((j) => {
        const hay = [
          j.company,
          j.title,
          j.location,
          j.track,
          j.visa_sponsorship,
          ...(j.tags || [])
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'pay') {
        return b.payScore - a.payScore;
      }
      if (sortBy === 'deadline') {
        const da = a.dday.days === null ? 9999 : a.dday.days;
        const db = b.dday.days === null ? 9999 : b.dday.days;
        return da - db;
      }
      // default: recent (age_days asc, then pay desc)
      const aa = typeof a.age_days === 'number' ? a.age_days : 50;
      const ab = typeof b.age_days === 'number' ? b.age_days : 50;
      if (aa !== ab) return aa - ab;
      return b.payScore - a.payScore;
    });

    return list;
  }

  // ---------------------------------------------------------------------------
  // 3. Multi-Environment Data Loader (Server API -> Static JSON -> Offline Snapshot)
  // ---------------------------------------------------------------------------
  async function tryFetchJson(urls) {
    if (window.location.protocol === 'file:') return null;
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res && res.ok) {
          return await res.json();
        }
      } catch (_) {}
    }
    return null;
  }

  async function loadAllData(relDataPrefix) {
    const prefix = relDataPrefix || '../data';
    const [profile, postings, resources] = await Promise.all([
      tryFetchJson(['/api/profile', `${prefix}/waterloo_math_profile.json`, './data/waterloo_math_profile.json']),
      tryFetchJson(['/api/postings', `${prefix}/internship_postings.json`, './data/internship_postings.json']),
      tryFetchJson(['/api/resources', `${prefix}/career_resources.json`, './data/career_resources.json'])
    ]);

    return {
      profile: profile && profile.student ? profile : OFFLINE_SNAPSHOT.profile,
      postings: Array.isArray(postings) && postings.length ? postings : OFFLINE_SNAPSHOT.postings,
      resources: resources && resources.categories ? resources : OFFLINE_SNAPSHOT.resources
    };
  }

  // ---------------------------------------------------------------------------
  // 4. Persistent Personalization State (Bookmarks, Applied, Checklist)
  // ---------------------------------------------------------------------------
  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJsonStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      window.dispatchEvent(new CustomEvent('uw-state-change', { detail: { key } }));
    } catch (_) {}
  }

  function getSet(key) {
    return new Set(readJsonStorage(key, []));
  }

  function toggleInSet(key, id) {
    const s = getSet(key);
    let active = false;
    if (s.has(id)) {
      s.delete(id);
    } else {
      s.add(id);
      active = true;
    }
    writeJsonStorage(key, Array.from(s));
    return active;
  }

  function toggleBookmark(jobId) {
    return toggleInSet(STORAGE_KEYS.BOOKMARKS, jobId);
  }

  function toggleApplied(jobId) {
    return toggleInSet(STORAGE_KEYS.APPLIED, jobId);
  }

  function getTrackerStats(activePostings) {
    const bm = getSet(STORAGE_KEYS.BOOKMARKS);
    const ap = getSet(STORAGE_KEYS.APPLIED);
    if (!Array.isArray(activePostings)) {
      return { bookmarkedCount: bm.size, appliedCount: ap.size };
    }
    const ids = new Set(activePostings.map((p) => p.id));
    let bCount = 0;
    let aCount = 0;
    bm.forEach((id) => { if (ids.has(id)) bCount += 1; });
    ap.forEach((id) => { if (ids.has(id)) aCount += 1; });
    return { bookmarkedCount: bCount, appliedCount: aCount };
  }

  function getChecklistState(profile) {
    const defaults = (profile && profile.default_checklist) || OFFLINE_SNAPSHOT.profile.default_checklist || [];
    const savedMap = readJsonStorage(STORAGE_KEYS.CHECKLIST, null) || {};
    const customTodos = readJsonStorage(STORAGE_KEYS.CUSTOM_TODOS, []);

    const baseItems = defaults.map((item) => ({
      id: item.id,
      phase: item.phase || '필수',
      text: item.text,
      done: Object.prototype.hasOwnProperty.call(savedMap, item.id) ? Boolean(savedMap[item.id]) : Boolean(item.default_done),
      isCustom: false
    }));

    const customItems = customTodos.map((item) => ({
      id: item.id,
      phase: item.phase || '내 목표',
      text: item.text,
      done: Object.prototype.hasOwnProperty.call(savedMap, item.id) ? Boolean(savedMap[item.id]) : Boolean(item.done),
      isCustom: true
    }));

    const all = [...baseItems, ...customItems];
    const doneCount = all.filter((x) => x.done).length;
    const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;
    return { items: all, doneCount, totalCount: all.length, pct };
  }

  function setChecklistDone(id, done, profile) {
    const defaults = (profile && profile.default_checklist) || OFFLINE_SNAPSHOT.profile.default_checklist || [];
    const savedMap = readJsonStorage(STORAGE_KEYS.CHECKLIST, null) || {};
    if (Object.keys(savedMap).length === 0) {
      defaults.forEach((d) => { savedMap[d.id] = Boolean(d.default_done); });
    }
    savedMap[id] = Boolean(done);
    writeJsonStorage(STORAGE_KEYS.CHECKLIST, savedMap);
  }

  function addCustomTodo(text, phase = '개인 목표') {
    const clean = String(text || '').trim();
    if (!clean) return false;
    const customTodos = readJsonStorage(STORAGE_KEYS.CUSTOM_TODOS, []);
    const id = 'custom_' + Date.now().toString(36);
    customTodos.push({ id, phase, text: clean, done: false });
    writeJsonStorage(STORAGE_KEYS.CUSTOM_TODOS, customTodos);
    return true;
  }

  function removeCustomTodo(id) {
    const customTodos = readJsonStorage(STORAGE_KEYS.CUSTOM_TODOS, []).filter((t) => t.id !== id);
    writeJsonStorage(STORAGE_KEYS.CUSTOM_TODOS, customTodos);
    const savedMap = readJsonStorage(STORAGE_KEYS.CHECKLIST, null) || {};
    if (Object.prototype.hasOwnProperty.call(savedMap, id)) {
      delete savedMap[id];
      writeJsonStorage(STORAGE_KEYS.CHECKLIST, savedMap);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. KakaoTalk & Telegram & Live Sync Helpers
  // ---------------------------------------------------------------------------
  function getKakaoKey() {
    try {
      return localStorage.getItem(STORAGE_KEYS.KAKAO_KEY) || DEFAULT_KAKAO_JS_KEY;
    } catch (_) {
      return DEFAULT_KAKAO_JS_KEY;
    }
  }

  async function syncKakaoKeyFromServer() {
    if (window.location.protocol === 'file:') {
      ensureKakaoReady();
      return getKakaoKey();
    }
    try {
      const res = await fetch('/api/kakao-config').catch(() => null);
      if (res && res.ok) {
        const cfg = await res.json();
        if (cfg.javascript_key && cfg.javascript_key.trim()) {
          localStorage.setItem(STORAGE_KEYS.KAKAO_KEY, cfg.javascript_key.trim());
        }
      }
    } catch (_) {}
    ensureKakaoReady();
    return getKakaoKey();
  }

  function ensureKakaoReady() {
    const key = getKakaoKey();
    if (!key || !window.Kakao) return false;
    try {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
      return window.Kakao.isInitialized();
    } catch (_) {
      return false;
    }
  }

  async function saveKakaoKey(newKey) {
    const key = String(newKey || '').trim();
    if (!key) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.KAKAO_KEY, key);
    } catch (_) {}
    if (window.Kakao && window.Kakao.isInitialized()) {
      try { window.Kakao.cleanup(); } catch (_) {}
    }
    if (window.location.protocol !== 'file:') {
      fetch('/api/kakao-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ javascript_key: key })
      }).catch(() => {});
    }
    return ensureKakaoReady();
  }

  function buildShareMessage(type, data, jobId = null) {
    const baseDate = todayKST();
    const postings = (data && data.postings) || OFFLINE_SNAPSHOT.postings;
    const profile = (data && data.profile) || OFFLINE_SNAPSHOT.profile;

    if (type === 'single_job' && jobId) {
      const job = postings.find((j) => j.id === jobId) || postings[0];
      if (!job) return '';
      const flag = job.country === 'CA' ? '🇨🇦 캐나다' : '🇺🇸 미국';
      return [
        '💼 [Waterloo Math 인턴십 추천 공고 공유]',
        '──────────────────────',
        `🏢 기업: ${job.company} (${flag})`,
        `📌 직무: ${job.title}`,
        `💰 급여: ${job.hourly_rate}`,
        `📍 지역: ${job.location}`,
        `🛂 비자: ${job.visa_sponsorship}`,
        `⏰ 마감: ${job.deadline}`,
        '',
        '📝 핵심 요약:',
        job.summary,
        '',
        `👉 공식 지원 링크: ${job.url}`,
        `📱 전체 대시보드 보기: ${CLOUD_URL}`
      ].join('\n');
    }

    if (type === 'jobs') {
      const activeJobs = getActivePostings(postings, baseDate);
      const caJobs = activeJobs.filter((j) => j.country === 'CA').slice(0, 4);
      const usJobs = activeJobs.filter((j) => j.country === 'US').slice(0, 4);
      const lines = [
        '💼 [Waterloo Math] 북미 인턴십 & Co-op 실시간 채용 브리핑',
        '──────────────────────',
        `📅 기준일: ${baseDate} (KST) | 추천 오픈 공고 ${activeJobs.length}건`,
        ''
      ];
      if (caJobs.length > 0) {
        lines.push('🇨🇦 [캐나다 주요 Co-op · 인턴십]');
        caJobs.forEach((j, idx) => {
          lines.push(`${idx + 1}. ${j.company} (${j.hourly_rate})`);
          lines.push(`   • ${j.title}`);
          lines.push(`   • 지역: ${j.location} | 마감: ${j.deadline}`);
          lines.push(`   • 지원: ${j.url}`);
        });
        lines.push('');
      }
      if (usJobs.length > 0) {
        lines.push('🇺🇸 [미국 J-1 비자 스폰서 주요 인턴십]');
        usJobs.forEach((j, idx) => {
          lines.push(`${idx + 1}. ${j.company} (${j.hourly_rate})`);
          lines.push(`   • ${j.title}`);
          lines.push(`   • 지역: ${j.location} | 마감: ${j.deadline}`);
          lines.push(`   • 지원: ${j.url}`);
        });
        lines.push('');
      }
      lines.push('──────────────────────');
      lines.push('📱 전체 공고 대시보드에서 보기:');
      lines.push(CLOUD_URL);
      return lines.join('\n');
    }

    if (type === 'link') {
      return [
        '📱 [Waterloo Math 2028] 수학과 1학년 · 2028 첫 코옵 커리어 포털',
        '──────────────────────',
        '• 1학년(1A/1B) 학사 & 2028 첫 공식 Co-op 마일스톤 D-Day',
        '• 캐나다/미국(Quant·AI·SWE·계리) 실시간 인턴십 검색 & 지원 트래커',
        '• 유학생 비자(CWP / J-1 / PGWP·STEM OPT) 및 01.DB 공식 리소스 13선',
        '',
        '👉 스마트폰/PC에서 바로 열기:',
        CLOUD_URL
      ].join('\n');
    }

    // Default: Full D-Day Schedule (2026-2027 short-term + 2028 Co-op Target)
    const upcoming = getUpcomingAlerts(profile.d_day_alerts || [], baseDate);
    const shortTerm = upcoming.filter((a) => a.phase_group === 'short_term' || String(a.due_date) < '2027-07-01');
    const shortIds = new Set(shortTerm.map((a) => a.id));
    const target2028 = upcoming.filter((a) => !shortIds.has(a.id));

    const lines = [
      '🎓 [Waterloo Math] 1학년 학사 & 2028 첫 Co-op 마일스톤 브리핑',
      '──────────────────────',
      `📅 기준일: ${baseDate} (KST) | 진행 일정 총 ${upcoming.length}건`,
      ''
    ];

    if (shortTerm.length > 0) {
      lines.push('🔥 [1] 1학년(1A/1B) 학사 · 비자 · 조기 인턴십');
      shortTerm.forEach((a) => {
        const icon = a.dday.isUrgent || a.urgency === 'high' ? '🔴' : '🟡';
        lines.push(`${icon} ${a.title}`);
        lines.push(`   • 일자: ${a.due_date} (${a.dday.label})`);
      });
      lines.push('');
    }

    if (target2028.length > 0) {
      lines.push('🎯 [2] 2028 첫 공식 Co-op (WT1) 핵심 로드맵');
      target2028.forEach((a) => {
        const icon = String(a.due_date).startsWith('2028-') ? '🟣' : '🔴';
        lines.push(`${icon} ${a.title}`);
        lines.push(`   • 일자: ${a.due_date} (${a.dday.label})`);
      });
      lines.push('');
    }

    lines.push('──────────────────────');
    lines.push('🌐 워털루 공식 일정: https://uwaterloo.ca/co-operative-education/important-dates');
    lines.push(`📱 대시보드 열기: ${CLOUD_URL}`);
    return lines.join('\n');
  }

  function sendKakaoSdkFeed(type, data, jobId = null) {
    if (!ensureKakaoReady()) return false;
    const postings = (data && data.postings) || OFFLINE_SNAPSHOT.postings;
    const fullText = buildShareMessage(type, data, jobId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText).catch(() => {});
    }

    const safeShareUrl =
      window.location.origin && window.location.origin.startsWith('http')
        ? window.location.href.split('?')[0]
        : CLOUD_URL;

    try {
      if (type === 'single_job' && jobId) {
        const job = postings.find((j) => j.id === jobId) || postings[0];
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `💼 [${job.company}] ${job.title}`,
            description: `${job.hourly_rate} · ${job.location} · 마감 ${job.deadline}\n${job.summary}`,
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
            link: { mobileWebUrl: safeShareUrl, webUrl: safeShareUrl }
          },
          buttons: [{ title: '채용공고 및 대시보드 열기', link: { mobileWebUrl: safeShareUrl, webUrl: safeShareUrl } }]
        });
        return true;
      }

      if (type === 'jobs') {
        const activeCount = getActivePostings(postings).length;
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '💼 [Waterloo Math] 북미 인턴십 & Co-op 실시간 브리핑',
            description: `캐나다(Waterloo/Toronto) 및 미국 J-1 비자 스폰서 퀀트·AI·SW·계리 오픈 공고 ${activeCount}건`,
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            link: { mobileWebUrl: safeShareUrl, webUrl: safeShareUrl }
          },
          buttons: [{ title: '전체 채용공고 대시보드 열기', link: { mobileWebUrl: safeShareUrl, webUrl: safeShareUrl } }]
        });
        return true;
      }

      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '🎓 [Waterloo Math] 1학년 & 2028 첫 Co-op 마일스톤 브리핑',
          description: '워털루 수학과 1학년(1A/1B) 학사·비자 점검 및 2028 첫 공식 코옵(WT1) 전체 D-Day 로드맵',
          imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
          link: { mobileWebUrl: safeShareUrl, webUrl: safeShareUrl }
        },
        buttons: [{ title: '실시간 대시보드 열기', link: { mobileWebUrl: safeShareUrl, webUrl: safeShareUrl } }]
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function triggerLiveSync() {
    if (window.location.protocol === 'file:') {
      return {
        success: false,
        offline: true,
        message: '오프라인 파일 열람 모드입니다. 실행하기_대시보드.bat 구동 시 실시간 크롤링이 즉시 작동하며, 클라우드에서는 매일 09:00 자동 갱신됩니다.'
      };
    }
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) throw new Error('local_api_unavailable');
      return await res.json();
    } catch (_) {
      return {
        success: false,
        cloudStatic: true,
        message: 'GitHub 클라우드에서는 매일 오전 09:00 자동 크롤링되며, 로컬 서버(run_server.py) 실행 시 웹에서 즉시 수동 수집됩니다.'
      };
    }
  }

  async function triggerTelegramAlert(type = 'dday') {
    if (window.location.protocol === 'file:') {
      return {
        success: false,
        offline: true,
        message: '로컬 서버(실행하기_대시보드.bat) 실행 시 웹에서 즉시 발송되며, GitHub Actions가 매일 09:00 스마트폰으로 자동 발송합니다.'
      };
    }
    try {
      const res = await fetch(`/api/notify?type=${encodeURIComponent(type)}`);
      if (!res.ok) throw new Error('notify_unavailable');
      return await res.json();
    } catch (_) {
      return {
        success: false,
        cloudStatic: true,
        message: 'GitHub Actions 클라우드 알림봇이 매일 09:00 스마트폰으로 자동 발송 중입니다.'
      };
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.UWCore = {
    CLOUD_URL,
    STORAGE_KEYS,
    OFFLINE_SNAPSHOT,
    todayKST,
    calcDDay,
    updateAllDDayNodes,
    parsePayScore,
    getActivePostings,
    getUpcomingAlerts,
    filterAndSortPostings,
    loadAllData,
    toggleBookmark,
    toggleApplied,
    getTrackerStats,
    getChecklistState,
    setChecklistDone,
    addCustomTodo,
    removeCustomTodo,
    getKakaoKey,
    syncKakaoKeyFromServer,
    ensureKakaoReady,
    saveKakaoKey,
    buildShareMessage,
    sendKakaoSdkFeed,
    triggerLiveSync,
    triggerTelegramAlert,
    escapeHtml
  };
})(window);
