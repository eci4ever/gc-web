import { createFileRoute } from "@tanstack/react-router";

import { LegalSection, LegalShell } from "@/components/legal-shell";

export const Route = createFileRoute("/terms")({
  component: () => (
    <LegalShell title="Terma Perkhidmatan">
      <p className="text-pretty">
        Dokumen ini adalah templat permulaan. Gantikan dengan terma sebenar produk anda sebelum
        pelancaran, dengan pertimbangan undang-undang yang berkaitan.
      </p>
      <LegalSection heading="1. Penggunaan perkhidmatan">
        <p>
          Perkhidmatan disediakan untuk penggunaan yang sah sahaja. Anda bertanggungjawab
          mengekalkan kerahsiaan kredensial akaun anda dan untuk semua aktiviti yang berlaku di
          bawah akaun anda.
        </p>
      </LegalSection>
      <LegalSection heading="2. Akaun dan workspace">
        <p>
          Setiap akaun disertakan satu workspace peribadi. Workspace tambahan boleh dicipta dan
          diuruskan mengikut peranan owner, admin, dan member.
        </p>
      </LegalSection>
      <LegalSection heading="3. Penamatan">
        <p>
          Kami berhak menggantung atau menamatkan akaun yang melanggar terma ini. Anda boleh
          memadamkan akaun anda sendiri pada bila-bila masa melalui halaman akaun.
        </p>
      </LegalSection>
    </LegalShell>
  ),
});
