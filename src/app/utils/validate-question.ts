/**
 * Validates user questions to filter out:
 * 1. Meaningless input (무의미한 입력)
 * 2. Out-of-scope questions (노무 범위 외)
 * 3. Inappropriate content (부적절한 내용)
 * 4. Unethical requests (윤리적 문제)
 * 5. Insufficient information (질문 보강 필요)
 */

export type ValidationReason = "meaningless" | "out-of-scope" | "inappropriate" | "unethical" | "insufficient";

export interface ValidationResult {
  isValid: boolean;
  reason?: ValidationReason;
  feedbackPoints?: string[]; // 보완이 필요한 항목들
}

export function validateQuestion(message: string): ValidationResult {
  const trimmed = message.trim();
  const lowerMessage = trimmed.toLowerCase();
  
  // 1. Check for meaningless input (무의미한 입력)
  // - 너무 짧거나, 한글 자음/모음만, 반복된 문자
  if (trimmed.length < 5 || !/[가-힣a-zA-Z]/.test(trimmed)) {
    return { isValid: false, reason: "meaningless" };
  }
  
  // Check for Korean consonants/vowels only (e.g., "ㅁㄴㅇㄹㅁㄴㄹ")
  const consonantsVowelsOnly = /^[ㄱ-ㅎㅏ-ㅣ\s]+$/;
  if (consonantsVowelsOnly.test(trimmed)) {
    return { isValid: false, reason: "meaningless" };
  }
  
  // Repeated characters (e.g., "aaaaa", "ㅋㅋㅋㅋㅋ") — 숫자는 제외(금액 1천만·1억 등 오탐 방지)
  const repeatedChars = /([^\d\s])\1{4,}/;
  if (repeatedChars.test(trimmed)) {
    return { isValid: false, reason: "meaningless" };
  }
  
  // Only special characters or numbers
  if (!/[가-힣a-zA-Z]{3,}/.test(trimmed)) {
    return { isValid: false, reason: "meaningless" };
  }
  
  // 2. Check for unethical/sensitive requests (윤리적 문제)
  // - 개별 해고 정당성 판단
  // - 노동청/법원 제출용 문서 작성
  // - 위법 운영 방법 문의
  const unethicalPatterns = [
    // 개별 해고 정당성 '단정'을 구하는 경우만 (일반 가능성/방법 문의는 정상 질문 → 제외)
    /(이|저|제가|우리|직원|근로자|사원).{0,20}(해고|징계).{0,20}(정당|타당|괜찮|문제없|합법)/i,
    /(해고|징계|권고사직).{0,10}(해도\s*되|시켜도\s*되|해버려)/i,
    /해고.{0,20}(사유|이유).{0,20}(충분|정당|괜찮|문제없)/i,
    
    // 노동청/법원 제출용 문서
    /(노동청|고용노동부|법원|법정|재판).{0,20}(제출|제출할|제출용).{0,20}(문서|서류|작성)/i,
    /(진정서|소장|답변서|준비서면|의견서).{0,20}(작성|써줘|만들어)/i,
    /(소송|재판|진정).{0,20}(문서|서류).{0,20}(작성|써줘)/i,
    
    // 위법 운영 방법
    /(어떻게|방법|절차).{0,20}(위법|불법|불법적|법 위반|탈법|회피|피해)/i,
    /(임금|급여|수당|퇴직금).{0,20}(안|미|덜|줄여|감축).{0,20}(주|지급|줘도)/i,
    /(연장근로|야간근로|휴일근로).{0,20}(수당|급여).{0,20}(안|미|덜).{0,20}(주|지급)/i,
    /(법|규정|제도).{0,20}(피해|회피|우회|탈법)/i,
  ];
  
  for (const pattern of unethicalPatterns) {
    if (pattern.test(lowerMessage)) {
      return { isValid: false, reason: "unethical" };
    }
  }
  
  // 3. Check if out of labor/HR scope (노무 범위 외)
  // 세법/노무 통합 서비스 → 노무 + 세법 키워드 모두 in-scope로 인정
  const laborKeywords = [
    "근로", "노동", "임금", "급여", "퇴직", "해고", "징계",
    "연차", "휴가", "휴직", "산재", "재해", "안전", "보건",
    "근무", "직장", "회사", "사업주", "근로자", "직원",
    "계약", "고용", "취업", "노조", "조합", "파견",
    "시간외", "연장", "야간", "휴일", "수당", "출산", "육아",
    "퇴직금", "연봉", "최저임금", "근로시간", "초과근무",
    // 사회보험(노무 인접)
    "보험", "4대보험", "국민연금", "건강보험", "고용보험",
    // 세법
    "세법", "세무", "세금", "부가세", "부가가치세", "소득세", "법인세",
    "연말정산", "원천징수", "공제", "과세", "납세", "신고", "환급"
  ];
  const hasLaborKeyword = laborKeywords.some(kw => lowerMessage.includes(kw));

  // 명시적 비-노무/비-세법 주제 (강한 신호에서만 범위 외 판정 — 오탐 방지)
  const nonLaborKeywords = [
    "날씨", "음식", "요리", "맛집", "메뉴", "저녁", "점심", "야식", "간식",
    "여행", "영화", "드라마", "게임", "축구", "야구", "농구", "스포츠", "운동",
    "주식", "부동산", "코인", "비트코인",
    "정치", "선거", "연예인", "아이돌", "소설", "만화", "애니메이션",
    "연애", "결혼식", "취미", "노래", "레시피"
  ];

  const hasNonLaborKeyword = nonLaborKeywords.some(kw => lowerMessage.includes(kw));

  // 명시적 비-노무/세법 주제 + 노무/세법 키워드 없음 → 범위 외
  // (키워드 부재만으로 판정하지 않음 → 미등록 키워드의 정상 질문 오탐 방지)
  if (hasNonLaborKeyword && !hasLaborKeyword) {
    return { isValid: false, reason: "out-of-scope" };
  }
  
  // 4. Check for inappropriate content (부적절한 내용)
  // ⚠ 부분문자열 매칭이라, 정상 노무어와 충돌하는 키워드는 제외했다.
  //   (백인→수백인, 성적→근무성적평정, 폭력→직장 내 폭력, 자살→자살 산재, 살인→살인적인 업무 등)
  //   충돌 위험이 낮고 명백히 부적절한 표현만 유지. 정교화 시 형태소/경계 기반으로 재구현 권장.
  const inappropriateKeywords = [
    "인종차별", "음란물", "포르노", "섹스"
  ];
  
  for (const keyword of inappropriateKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { isValid: false, reason: "inappropriate" };
    }
  }
  
  // 5. Check for insufficient information (질문 보강 필요)
  // 노무 관련 키워드는 있지만, 구체적인 상황이 부족한 경우
  const feedbackPoints: string[] = [];
  
  // 너무 짧고 애매한 질문들
  const vaguePhrases = [
    /^(퇴직금|연차|임금|급여|해고|징계|휴가|수당).{0,5}(문의|질문|궁금|알려|여쭤|물어)$/i,
    /^(해고|징계).{0,5}(관련|관해|대해).{0,5}(질문|문의)$/i,
    /^(연차|휴가).{0,5}(문의|질문)$/i,
  ];
  
  const isVague = vaguePhrases.some(pattern => pattern.test(trimmed));
  
  if (isVague) {
    // 구체적인 보완 항목 제시
    if (lowerMessage.includes("퇴직금")) {
      feedbackPoints.push("근속 연수와 평균임금을 알려주세요");
      feedbackPoints.push("퇴직금 중간정산 여부를 알려주세요");
      feedbackPoints.push("구체적으로 궁금하신 사항을 명시해주세요 (계산방법, 지급시기, 중간정산 등)");
    } else if (lowerMessage.includes("연차") || lowerMessage.includes("휴가")) {
      feedbackPoints.push("근속 연수와 소정근로일수를 알려주세요");
      feedbackPoints.push("정규직/계약직 여부를 알려주세요");
      feedbackPoints.push("구체적으로 궁금하신 사항을 명시해주세요 (발생일수, 사용방법, 수당지급 등)");
    } else if (lowerMessage.includes("해고") || lowerMessage.includes("징계")) {
      feedbackPoints.push("해고/징계 사유를 구체적으로 설명해주세요");
      feedbackPoints.push("근로자의 근속기간과 직급을 알려주세요");
      feedbackPoints.push("취업규칙이나 단체협약에 관련 규정이 있는지 알려주세요");
    } else if (lowerMessage.includes("임금") || lowerMessage.includes("급여")) {
      feedbackPoints.push("임금 지급 방식과 주기를 알려주세요");
      feedbackPoints.push("구체적으로 궁금하신 사항을 명시해주세요 (체불, 지급방법, 공제항목 등)");
    } else {
      feedbackPoints.push("구체적인 상황을 설명해주세요 (언제, 누가, 무엇을, 어떻게)");
      feedbackPoints.push("근로자의 고용형태와 근속기간을 알려주세요");
      feedbackPoints.push("궁금하신 사항을 명확히 질문해주세요");
    }
    
    return { isValid: false, reason: "insufficient", feedbackPoints };
  }
  
  // 단어만 나열한 경우
  if (trimmed.length < 15 && hasLaborKeyword && !trimmed.includes("?") && !trimmed.includes("요") && !trimmed.includes("까")) {
    feedbackPoints.push("완전한 문장으로 질문해주세요");
    feedbackPoints.push("구체적인 상황과 궁금하신 점을 설명해주세요");
    return { isValid: false, reason: "insufficient", feedbackPoints };
  }
  
  return { isValid: true };
}