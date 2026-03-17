import { X, Scale, FileText, Gavel, BookOpen } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface LawDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lawName: string;
}

// 법령명에서 법령 타입 추출
const getLawType = (lawName: string): "법령" | "해석례" | "판례" => {
  if (lawName.includes("판결") || lawName.includes("대법원") || lawName.includes("고등법원")) {
    return "판례";
  }
  if (lawName.includes("해석") || lawName.includes("예규") || lawName.includes("지침")) {
    return "해석례";
  }
  return "법령";
};

// 법령 타입별 스타일
const getLawTypeStyles = (type: "법령" | "해석례" | "판례") => {
  switch (type) {
    case "법령":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/20",
        iconBg: "bg-indigo-500",
        textColor: "text-indigo-600 dark:text-indigo-400",
      };
    case "해석례":
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        iconBg: "bg-green-500",
        textColor: "text-green-600 dark:text-green-400",
      };
    case "판례":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/20",
        iconBg: "bg-purple-500",
        textColor: "text-purple-600 dark:text-purple-400",
      };
  }
};

// 법령 원문 데이터 (Mock)
const getLawContent = (lawName: string): string => {
  // 법령명에 따라 더미 콘텐츠 반환
  if (lawName.includes("근로기준법")) {
    if (lawName.includes("제60조")) {
      return `제60조(연차 유급휴가)

① 사용자는 1년간 80퍼센트 이상 출근한 근로자에게 15일의 유급휴가를 주어야 한다.

② 사용자는 계속하여 근로한 기간이 1년 미만인 근로자 또는 1년간 80퍼센트 미만 출근한 근로자에게 1개월 개근 시 1일의 유급휴가를 주어야 한다.

③ 사용자는 근로자의 최초 1년간의 근로에 대하여 유급휴가를 주는 경우에는 제2항에 따른 유급휴가를 포함하여 15일로 하고, 근로자가 제2항에 따른 유급휴가를 이미 사용한 경우에는 그 사용한 휴가 일수를 15일에서 뺀다.

④ 사용자는 3년 이상 계속하여 근로한 근로자에게는 제1항에 따른 휴가에 최초 1년을 초과하는 계속 근로 연수 매 2년에 대하여 1일을 가산한 유급휴가를 주어야 한다. 이 경우 가산휴가를 포함한 총 휴가 일수는 25일을 한도로 한다.

⑤ 사용자는 제1항부터 제4항까지의 규정에 따른 휴가를 근로자가 청구한 시기에 주어야 하고, 그 기간에 대하여는 취업규칙 등에서 정하는 통상임금 또는 평균임금을 지급하여야 한다. 다만, 근로자가 청구한 시기에 휴가를 주는 것이 사업 운영에 막대한 지장이 있는 경우에는 그 시기를 변경할 수 있다.

⑥ 제1항부터 제3항까지의 규정을 적용하는 경우 다음 각 호의 어느 하나에 해당하는 기간은 출근한 것으로 본다.
1. 근로자가 업무상의 부상 또는 질병으로 휴업한 기간
2. 임신 중의 여성이 제74조제1항부터 제3항까지의 규정에 따라 휴업한 기간
3. 「남녀고용평등과 일·가정 양립 지원에 관한 법률」 제19조제1항에 따라 육아휴직으로 휴업한 기간`;
    } else if (lawName.includes("제30조")) {
      return `근로기준법 시행령 제30조(연차 유급휴가의 사용 촉진)

① 사용자는 「근로기준법」(이하 "법"이라 한다) 제61조에 따라 근로자의 미사용 휴가에 대하여 사용하도록 촉구하려는 경우에는 다음 각 호의 어느 하나에 해당하는 조치를 하여야 한다.
1. 휴가를 사용하도록 서면으로 촉구
2. 근로자대표와의 서면 합의
3. 그 밖에 휴가를 사용하도록 적극 권장하는 조치

② 사용자가 제1항 각 호의 조치를 하였음에도 불구하고 근로자가 휴가를 사용하지 아니하여 소멸된 경우에는 사용자는 그 사용하지 아니한 휴가에 대하여 보상할 의무가 없다.`;
    }
  } else if (lawName.includes("법인세법")) {
    if (lawName.includes("제1조")) {
      return `제1조(목적)
이 법은 법인의 소득 등에 대한 과세에 관하여 필요한 사항을 규정함을 목적으로 한다.`;
    } else if (lawName.includes("제2조")) {
      return `제2조(정의)
이 법에서 사용하는 용어의 뜻은 다음과 같다.

1. "내국법인"이란 국내에 본점이나 주사무소 또는 사업의 실질적 관리장소를 둔 법인을 말한다.
2. "외국법인"이란 국내에 본점이나 주사무소 또는 사업의 실질적 관리장소를 두지 아니한 법인을 말한다.
3. "비영리법인"이란 민법 제32조, 공익법인의 설립·운영에 관한 법률, 그 밖의 법률에 따라 주무관청의 허가를 받아 설립된 법인으로서 영리를 목적으로 하지 아니하는 법인을 말한다.`;
    }
  } else if (lawName.includes("판결")) {
    return `대법원 2017다232132 판결 [임금청구의 소]

【판시사항】
근로자가 연차유급휴가를 청구하면서 그 사용 사유를 밝혀야 하는지 여부(소극)

【판결요지】
근로기준법 제60조 제5항은 "사용자는 제1항부터 제4항까지의 규정에 따른 휴가를 근로자가 청구한 시기에 주어야 한다"고 규정하고 있다.

근로자의 연차유급휴가 사용권은 법정요건이 충족되면 법률상 당연히 발생하고, 근로자가 사용자에게 연차유급휴가의 사용 시기를 특정하여 청구함으로써 사용할 수 있다.

따라서 근로자가 연차유급휴가를 청구하면서 그 사용 사유를 밝힐 의무는 없고, 사용자는 근로자가 청구한 시기에 연차유급휴가를 주어야 하며, 근로자의 연차유급휴가 사용 사유가 무엇인지를 근거로 연차유급휴가 사용을 제한할 수 없다.`;
  }

  return `${lawName}

법령 원문 내용이 준비 중입니다.

이 법령에 대한 상세 정보는 국가법령정보센터(www.law.go.kr)에서 확인하실 수 있습니다.`;
};

export function LawDetailSidebar({ isOpen, onClose, lawName }: LawDetailSidebarProps) {
  if (!isOpen) return null;

  const lawType = getLawType(lawName);
  const styles = getLawTypeStyles(lawType);
  const content = getLawContent(lawName);

  const getIcon = () => {
    switch (lawType) {
      case "법령":
        return Scale;
      case "해석례":
        return FileText;
      case "판례":
        return Gavel;
    }
  };

  const Icon = getIcon();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className={`p-6 border-b border-border ${styles.bg}`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${styles.textColor} px-2 py-0.5 bg-white/50 dark:bg-gray-900/50 rounded`}>
                  {lawType}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                {lawName}
              </h2>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-card border border-border rounded-lg p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {content}
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  위 내용은 참고용이며, 정확한 법령 내용은 국가법령정보센터에서 확인하시기 바랍니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
