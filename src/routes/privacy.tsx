import { createFileRoute } from "@tanstack/react-router";

import { LegalSection, LegalShell } from "@/components/legal-shell";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <LegalShell title="Polisi Privasi">
      <p className="text-pretty">
        Dokumen ini adalah templat permulaan. Laraskan kepada realiti produk anda (pembekal hosting,
        pemproses data, dan keperluan undang-undang tempatan) sebelum pelancaran.
      </p>
      <LegalSection heading="1. Data yang dikumpul">
        <p>
          Kami menyimpan nama, alamat email, dan kandungan workspace yang anda cipta. Sesi log masuk
          direkodkan bersama alamat IP dan agen pelayar untuk keselamatan akaun.
        </p>
      </LegalSection>
      <LegalSection heading="2. Penggunaan data">
        <p>
          Data digunakan untuk menyediakan perkhidmatan: pengesahan akaun, jemputan workspace, dan
          komunikasi berkaitan akaun. Kami tidak menjual data anda.
        </p>
      </LegalSection>
      <LegalSection heading="3. Pemadaman">
        <p>
          Memadamkan akaun anda akan membuang data peribadi dan workspace yang anda miliki. Entri
          audit yang tiada kaitan identiti mungkin dikekalkan untuk rekod keselamatan.
        </p>
      </LegalSection>
    </LegalShell>
  ),
});
