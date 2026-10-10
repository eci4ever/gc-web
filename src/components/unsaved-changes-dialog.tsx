import { useBlocker } from "@tanstack/react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Blocks in-app navigation while `dirty` and asks via a themed dialog.
 *  Tab close/reload still uses the native beforeunload prompt. */
export function UnsavedChangesDialog({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker({
    disabled: !dirty,
    enableBeforeUnload: dirty,
    withResolver: true,
    shouldBlockFn: () => true,
  });

  return (
    <AlertDialog
      open={blocker.status === "blocked"}
      onOpenChange={(open) => {
        if (!open) blocker.reset?.();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Perubahan belum disimpan</AlertDialogTitle>
          <AlertDialogDescription>
            Tinggalkan halaman ini tanpa menyimpan? Perubahan anda akan hilang.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset?.()}>Kekal di sini</AlertDialogCancel>
          <AlertDialogAction onClick={() => blocker.proceed?.()}>Tinggalkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
