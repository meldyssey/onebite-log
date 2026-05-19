import { useOpenPostEditorModal } from "@/store/post-editor-modal";
import { PlusCircleIcon } from "lucide-react";

export default function CreatePostButton() {
  const openPostEditorModal = useOpenPostEditorModal();
  return (
    <div
      onClick={openPostEditorModal}
      className="bg-muted text-muted-foreground rounded-xl px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div>나누고 싶은 이야기가 있나?</div>
        <PlusCircleIcon className="h-5 w-5" />
      </div>
    </div>
  );
}
