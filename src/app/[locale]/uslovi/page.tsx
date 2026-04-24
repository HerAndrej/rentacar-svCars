import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl sm:text-5xl mb-4">
            {t('title')}
          </h1>
          <p className="text-text-secondary text-lg">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-10 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              1. Potrebni dokumenti
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Vazeca osobna iskaznica ili putovnica</li>
              <li>Vazeca vozacka dozvola (minimalno 2 godine)</li>
              <li>Minimalna dob vozaca: 21 godina (za premium vozila: 25 godina)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              2. Kaucija
            </h2>
            <p>
              Prilikom preuzimanja vozila potrebno je ostaviti kauciju u gotovini ili putem kartice.
              Iznos kaucije ovisi o kategoriji vozila. Kaucija se vraca u cijelosti po vracanju vozila
              u ispravnom stanju.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              3. Osiguranje
            </h2>
            <p>
              Sva vozila su potpuno osigurana. Osnovno osiguranje je ukljuceno u cijenu najma.
              Dodatno osiguranje (CDW, SCDW) dostupno je na upit.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              4. Gorivo
            </h2>
            <p>
              Vozilo se preuzima sa punim rezervoarom i vraca sa punim rezervoarom.
              U slucaju vracanja s manjkom goriva, naplacuje se razlika po trzisnoj cijeni + naknada za dopunu.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              5. Kilometraza
            </h2>
            <p>
              Dnevni najam ukljucuje neogranicenu kilometrazu osim ako nije drugacije dogovoreno.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              6. Otkazivanje
            </h2>
            <p>
              Besplatno otkazivanje do 24 sata prije dogovorenog preuzimanja.
              Otkazivanje unutar 24 sata podlijeze naknadi.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl text-text-primary mb-4">
              7. Dostava
            </h2>
            <p>
              Besplatna dostava u gradu Mostaru. Dostava na aerodrom, hotel ili drugu lokaciju
              moze se dogovoriti uz dodatnu naknadu zavisno od udaljenosti.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
