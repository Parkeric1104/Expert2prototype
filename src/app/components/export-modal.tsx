import { X, FileDown } from "lucide-react";
import { Checkbox } from "@/app/components/ui/checkbox";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  if (!isOpen) return null;

  const handleExport = () => {
    // Mock export functionality
    alert("Opinion letter exported successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground">Export Opinion Letter</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-6 p-6">
          {/* Options Column */}
          <div className="w-1/3 space-y-4">
            <div>
              <h3 className="font-semibold mb-3 text-card-foreground">Export Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm">Format: MS Word (.docx)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm">Include Case Law</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox />
                  <span className="text-sm">Include Stamp/Signature</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm">Include Header/Footer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="flex-1 border border-border rounded-lg bg-gray-50 p-6 overflow-y-auto max-h-[400px]">
            <div className="bg-white p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Legal Opinion Letter</h3>
              <div className="space-y-4 text-sm">
                <section>
                  <h4 className="font-semibold mb-2">1. Factual Summary</h4>
                  <p className="text-muted-foreground">
                    Employee A joined the company in January 2023 and was employed in the sales department. 
                    In October 2025, the employer issued a dismissal notice citing poor performance...
                  </p>
                </section>
                <section>
                  <h4 className="font-semibold mb-2">2. Legal Standard</h4>
                  <p className="text-muted-foreground">
                    According to Article 23 of the Labor Standards Act, an employer shall not dismiss, 
                    lay off, suspend, or transfer a worker, reduce wages, or take other punitive measures 
                    against him/her without just cause.
                  </p>
                </section>
                <section>
                  <h4 className="font-semibold mb-2">3. Analysis</h4>
                  <p className="text-muted-foreground">
                    Based on precedents from the Supreme Court (2020Da12345), dismissal for poor performance 
                    requires objective evidence and prior warnings...
                  </p>
                </section>
                <section>
                  <h4 className="font-semibold mb-2">4. Conclusion</h4>
                  <p className="text-muted-foreground">
                    The dismissal appears to lack sufficient legal grounds and may be challenged 
                    as unfair dismissal under the Labor Standards Act.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-border bg-white text-foreground hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-5 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
