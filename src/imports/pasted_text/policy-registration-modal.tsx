'use strict';

import React, { useState } from 'react';
import { Search, X, FolderKanban, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- 피그마 이미지 기반 Mock 데이터 ---
const mockBoxes = [
  { id: 'box1', name: '2024 인사평가 기준 및 절차 안내 AI Box', date: '2024.03.18' },
  { id: 'box2', name: '인사팀 AI Box', date: '2024.03.15' },
  { id: 'box3', name: '[참고] 타사 취업규칙 벤치마킹 데이터', date: '2024.03.10' },
  { id: 'box4', name: '영업본부 성과급 지급 규정 관련', date: '2024.03.05' },
];

interface PolicyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedBoxId: string | null) => void;
}

export const PolicyRegistrationModal: React.FC<PolicyRegistrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  // --- 상태 관리: 다중 선택(string[])에서 단일 선택(string | null)으로 변경 ---
  // 피그마 이미지처럼 'box2'가 미리 선택된 상태로 시뮬레이션
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>('box2'); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- 핵심 로직: 단일 선택 및 자동 교체 구현 ---
  const handleSelectBox = (boxId: string) => {
    // 이미 선택된 항목을 다시 누르면 해제 (토글 방식 원할 경우)
    // if (selectedBoxId === boxId) {
    //   setSelectedBoxId(null);
    // } else {
    //   setSelectedBoxId(boxId); // 새로운 항목 선택 (기존 것은 자동 해제됨)
    // }

    // 피그마 UX처럼 라디오 버튼 방식 (클릭 시 무조건 해당 항목 선택)
    setSelectedBoxId(boxId); 
  };

  const selectedBoxName = mockBoxes.find(b => b.id === selectedBoxId)?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 헤더 영역 */}
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold text-gray-900">AI Box 선택</DialogTitle>
        </DialogHeader>

        {/* 메인 콘텐츠 영역 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 탭 메뉴 */}
          <Tabs defaultValue="my-box" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="my-box" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow text-gray-600 font-medium py-2.5">
                내 AI Box
              </TabsTrigger>
              <TabsTrigger value="company-box" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow text-gray-600 font-medium py-2.5">
                전사 AI Box
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 검색창 */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="AI Box 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-6 border-gray-200 focus-visible:ring-blue-200 rounded-xl"
            />
          </div>

          {/* AI Box 리스트 테이블 */}
          <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[50px_1fr_120px] items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-600 text-center">선택</div>
              <div className="text-sm font-semibold text-gray-600">AI Box 명</div>
              <div className="text-sm font-semibold text-gray-600 text-center">등록일자</div>
            </div>

            {/* 테이블 바디 (스크롤) */}
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
              {mockBoxes.map((box) => {
                const isSelected = selectedBoxId === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => handleSelectBox(box.id)}
                    className={`grid grid-cols-[50px_1fr_120px] items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 hover:bg-blue-100/70 border-l-4 border-l-blue-500 -ml-[1px]' // 선택 시 하이라이트 스타일
                        : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* 선택 UI: 동그란 라디오 버튼 형태로 구현 */}
                    <div className="flex justify-center items-center">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-blue-600 bg-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-600" /> // 가운데 파란 점
                        )}
                      </div>
                    </div>

                    {/* AI Box 정보 */}
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : 'bg-gray-100'}`}>
                        <FolderKanban className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <span className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                        {box.name}
                      </span>
                    </div>

                    {/* 등록일자 */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <span>{box.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- 피그마 이미지 하단 선택 정보 영역 --- */}
        {selectedBoxId && selectedBoxName && (
          <div className="border-t pt-4 mt-1 bg-gray-50 p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800">
                선택된 항목 <span className="text-blue-700">(1개)</span>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedBoxId(null)} // 선택 해제
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-1.5"
              >
                <X className="w-4 h-4" />
                선택 정보 삭제
              </Button>
            </div>
            
            {/* 선택된 칩 (Tag) */}
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 bg-blue-100/70 text-blue-800 text-sm px-4 py-2.5 rounded-full border border-blue-200 font-medium shadow-sm">
                <span>[{selectedBoxName}]</span>
                <button onClick={() => setSelectedBoxId(null)} className="ml-1 text-blue-500 hover:text-blue-800 transition-colors">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 액션 버튼 영역 */}
        <DialogFooter className="p-6 border-t bg-white gap-3">
          <Button onClick={onClose} variant="outline" className="px-7 py-5 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl">
            취소
          </Button>
          <Button 
            onClick={() => onConfirm(selectedBoxId)} 
            disabled={!selectedBoxId} // 선택된 항목이 없으면 비활성화
            className="px-7 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};