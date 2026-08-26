/**
 * BO 버전정보 (VER-001~003) — 조회 전용.
 * 서비스 버전(배포 파이프라인)·법령 DB 갱신일(법령 적재 배치)이 자동 기록되며,
 * BO는 서버에서 받은 현재 값과 변경 이력을 리스트업만 한다. 운영 수동 등록 없음.
 */
import { useState } from "react";
import { loadVersion, loadVersionLog, BOVersionLog } from "@/app/bo/bo-store";
import { PageHeader, Card, StatusDot, Pagination } from "@/app/bo/bo-ui";

const PAGE_SIZE = 5;

export function VersionAdmin() {
  const [current] = useState(() => loadVersion());
  const [log] = useState<BOVersionLog[]>(() => loadVersionLog());
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(log.length / PAGE_SIZE));
  const pageItems = log.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="버전정보"
        desc="배포·법령 DB 갱신 시 자동으로 기록돼요. 운영에서 별도로 등록하지 않아요."
        action={
          <span className="inline-flex items-center h-8 px-3 rounded-lg bg-gray-100 text-xs font-semibold text-muted-foreground">
            자동 기록 · 조회 전용
          </span>
        }
      />

      {/* 현재 값 요약 카드 (서버 수신 값) */}
      <Card className="p-5 mb-4">
        <StatusDot tone="green" label="현재 표기 중인 버전" />
        <div className="mt-2 flex items-end gap-8">
          <div>
            <p className="text-2xl font-bold text-foreground">{current.service}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">서비스 버전 — 메인 푸터 표기</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{current.lawDataUpdatedAt}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">법령 DB 갱신일 — 푸터·법령 카테고리 하단 표기</p>
          </div>
        </div>
      </Card>

      {/* 변경 이력 — 파이프라인이 기록한 이력 리스트(읽기 전용) */}
      <Card className="p-5">
        <h2 className="text-base font-bold text-foreground mb-4">변경 이력</h2>
        {/* 좁은 화면에서는 테이블만 가로 스크롤(글자 넘침 방지) */}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="font-medium px-3 py-1 whitespace-nowrap">변경일시</th>
              <th className="font-medium px-3 py-1 whitespace-nowrap">서비스 버전</th>
              <th className="font-medium px-3 py-1 whitespace-nowrap">법령 DB 갱신일</th>
              <th className="font-medium px-3 py-1 whitespace-nowrap">작성자</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((l) => (
              <tr key={l.id} className="bg-gray-50/80 text-[13px] text-foreground/90">
                <td className="px-3 py-2.5 rounded-l-lg whitespace-nowrap text-muted-foreground">{l.changedAt}</td>
                <td className={`px-3 py-2.5 whitespace-nowrap ${l.changed.includes("service") ? "font-semibold" : "text-muted-foreground"}`}>{l.service}</td>
                <td className={`px-3 py-2.5 whitespace-nowrap ${l.changed.includes("lawDataUpdatedAt") ? "font-semibold" : "text-muted-foreground"}`}>{l.lawDataUpdatedAt}</td>
                <td className="px-3 py-2.5 rounded-r-lg whitespace-nowrap text-muted-foreground">
                  {l.by ?? "—"}
                  {l.changed.length === 0 && (
                    <span className="ml-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-200/70 text-gray-600">최초 등록</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {log.length === 0 && <p className="py-14 text-center text-sm text-muted-foreground">기록된 이력이 없어요.</p>}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
