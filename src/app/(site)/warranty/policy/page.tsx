import type { Metadata } from "next";
import { load } from "cheerio";
import Link from "next/link";
import SourceContentPage, {
  generateMetadata as getSourceMetadata,
} from "@/app/(site)/[...path]/page";
import { NavigationBackground } from "@/components/layout/navigation-background";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { sunford } from "@/features/home/data/brand";
import styles from "./warranty-policy.module.css";

const title = "นโยบายการรับประกันสินค้า";
const sourceProps = { params: Promise.resolve({ path: ["warranty", "policy"] }) };

// These headings describe the existing clauses in their original order.
const clauseHeadings = [
  "ระยะเวลาและสิทธิประโยชน์",
  "ขอบเขตการรับประกันและการส่งเข้ารับบริการ",
  "การลงทะเบียนและหลักฐานการรับประกัน",
  "ส่วนประกอบที่ไม่อยู่ในการรับประกัน",
  "ป้าย ตราประทับ และเอกสารของราชการ",
  "กรณีปฏิเสธการรับประกัน",
  "ความเสียหายที่อยู่นอกเหนือการรับประกัน",
  "ความเสียหายต่อบุคคล ทรัพย์สิน หรือธุรกิจ",
  "ข้อมูลการลงทะเบียนที่ไม่ถูกต้องหรือไม่ครบถ้วน",
  "ชื่อผู้ลงทะเบียนและหลักฐานความเป็นเจ้าของ",
  "การเปลี่ยนแปลงเงื่อนไขการรับประกัน",
] as const;

// Transcribed from the warranty table in the imported policy.
const benefits = [
  ["ภายใน 7 วัน นับจากวันที่ซื้อ", "เปลี่ยนสินค้าใหม่ทันที + ไม่มีค่าใช้จ่าย"],
  ["ภายใน 90 วัน นับจากวันที่ซื้อ", "ฟรีค่าบริการตรวจซ่อม + ฟรีค่าอะไหล่ทุกรายการ"],
  [
    "ภายใน 91 วัน - 1 ปี นับจากวันที่ซื้อ",
    "ฟรีค่าบริการตรวจซ่อม + ฟรีค่าอะไหล่เฉพาะอุปกรณ์รับน้ำหนัก (loadcell) + ชำระค่าอะไหล่อื่นครึ่งราคา (ถ้ามี)",
  ],
  ["ภายใน 1 ปี - 3 ปี นับจากวันที่ซื้อ", "ฟรีค่าบริการตรวจซ่อม + ชำระค่าอะไหล่ครึ่งราคา (ถ้ามี)"],
  [
    "หลังจาก 3 ปีขึ้นไป (นอกระยะเวลารับประกัน)",
    "ชำระค่าบริการตรวจซ่อม + ชำระค่าอะไหล่ตามจริง (ถ้ามี)",
  ],
] as const;

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

async function getImportedPolicy() {
  const page = (await getContentPageIndex())[sunford.warrantyPolicy];
  if (page?.path !== sunford.warrantyPolicy || page.kind !== "page" || page.managed) return;

  const $ = load(page.html, null, false);
  const section = $("section").first();
  const introduction = normalizeText(section.children("div").first().text());
  const items = section.find("ol").first().children("li");
  const tableImage = items.first().find('img[src="/images/imported/d43f5d4327d2e104b78b.png"]');
  if (!introduction || items.length !== clauseHeadings.length || tableImage.length !== 1) return;

  const clauses = clauseHeadings.map((heading, index) => {
    const clause = items.eq(index);
    const body = clause.clone();
    body.children("ol").remove();
    return {
      id: `clause-${index + 1}`,
      number: index + 1,
      heading,
      paragraphs: normalizeText(body.text()).split(
        / (?=โดยลูกค้าส่งสินค้า|โดยลูกค้าเป็นผู้รับผิดชอบ|บริษัทถือวันที่|\(ในกรณีที่ลูกค้าสั่งซื้อ)/,
      ),
      subclauses: clause
        .children("ol")
        .children("li")
        .map((_, item) => normalizeText($(item).text()))
        .get(),
    };
  });

  return { introduction, clauses };
}

export async function generateMetadata(): Promise<Metadata> {
  if (!(await getImportedPolicy())) return getSourceMetadata(sourceProps);

  return {
    title,
    description:
      "นโยบายการรับประกันเครื่องชั่งดิจิตอล SUNFORD ระยะเวลาและสิทธิประโยชน์ การลงทะเบียน การส่งสินค้าเข้ารับบริการ และข้อยกเว้น",
  };
}

function Contents({
  clauses,
}: {
  clauses: readonly { id: string; number: number; heading: string }[];
}) {
  return (
    <nav aria-label="สารบัญนโยบายการรับประกัน" className={styles.contents}>
      <ol>
        {clauses.map(({ id, number, heading }) => (
          <li key={id}>
            <a href={`#${id}`}>
              <span>{number}.</span>
              {heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BenefitsTable() {
  return (
    <table
      className={styles.benefits}
      aria-label="ระยะเวลารับประกันสินค้าและสิทธิประโยชน์ในการเข้ารับบริการ"
    >
      <thead>
        <tr>
          <th scope="col">ระยะเวลารับประกันสินค้า</th>
          <th scope="col">สิทธิประโยชน์ในการเข้ารับบริการ</th>
        </tr>
      </thead>
      <tbody>
        {benefits.map(([period, coverage]) => (
          <tr key={period}>
            <th scope="row">{period}</th>
            <td>{coverage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function WarrantyPolicyPage() {
  const policy = await getImportedPolicy();
  if (!policy) return <SourceContentPage {...sourceProps} />;

  return (
    <NavigationBackground as="main" id="main-content" className={styles.page}>
      <article className={styles.report} aria-labelledby="warranty-policy-title">
        <header className={styles.heading}>
          <h1 id="warranty-policy-title">{title}</h1>
          <p>{policy.introduction}</p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.desktopContents}>
            <h2>สารบัญ</h2>
            <Contents clauses={policy.clauses} />
          </aside>
          <details className={styles.mobileContents}>
            <summary>สารบัญ</summary>
            <Contents clauses={policy.clauses} />
          </details>

          <div className={styles.clauses}>
            {policy.clauses.map(({ id, number, heading, paragraphs, subclauses }) => (
              <section key={id} id={id} className={styles.clause} tabIndex={-1}>
                <h2>
                  <span>{number}.</span>
                  {heading}
                </h2>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {number === 1 && <BenefitsTable />}
                {subclauses.length > 0 && (
                  <ol className={styles.subclauses}>
                    {subclauses.map((text, index) => (
                      <li key={text}>
                        <span>{`${number}.${index + 1}`}</span>
                        {text}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}
            <nav className={styles.related} aria-label="บริการที่เกี่ยวข้องกับการรับประกัน">
              <Link href={sunford.warranty}>ลงทะเบียนรับประกัน</Link>
              <Link href={sunford.contact}>ติดต่อฝ่ายบริการ</Link>
            </nav>
          </div>
        </div>
      </article>
    </NavigationBackground>
  );
}
