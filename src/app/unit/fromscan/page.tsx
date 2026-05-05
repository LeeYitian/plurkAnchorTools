import { Suspense } from "react";
import RetrivePage from "./features/RetrivePage/RetrivePage";

export default function FromScan() {
  return (
    <Suspense>
      <RetrivePage />
    </Suspense>
  );
}
