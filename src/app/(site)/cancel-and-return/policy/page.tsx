import type { Metadata } from "next";
import { load } from "cheerio";
import Link from "next/link";
import { Fragment } from "react";
import SourceContentPage, {
  generateMetadata as getSourceMetadata,
} from "@/app/(site)/[...path]/page";
import { NavigationBackground } from "@/components/layout/navigation-background";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { sunford } from "@/features/home/data/brand";
import { siteMenuLabel } from "@/features/site/data/site-menu-labels";
import styles from "../../warranty/policy/warranty-policy.module.css";
import returnStyles from "./return-policy.module.css";

const path = "/cancel-and-return/policy";
const title = "นโยบายการยกเลิกและคืนสินค้า";
const sourceProps = { params: Promise.resolve({ path: ["cancel-and-return", "policy"] }) };

async function getImportedPolicy() {
  const page = (await getContentPageIndex())[path];
  if (page?.path !== path || page.kind !== "page" || page.managed) return;

  const $ = load(page.html, null, false);
  const items = $("section").first().find("ol").first().children("li").toArray();
  if (items.length !== 7 || items.some((item) => !$(item).children("span").first().text().trim())) {
    return;
  }

  return items.map((item, index) => {
    const heading = $(item).children("span").first();
    const label = heading.text().trim();
    heading.remove();

    const body = $(item)
      .contents()
      .toArray()
      .map((node, position) => {
        if (node.type === "text") {
          const text = node.data.trim();
          return text ? <p key={position}>{text}</p> : null;
        }
        if (node.type !== "tag") return null;

        if (node.name === "ul") {
          return (
            <ul key={position} className={returnStyles.conditions}>
              {$(node)
                .children("li")
                .toArray()
                .map((condition) => {
                  const text = $(condition).text().trim();
                  return <li key={text}>{text}</li>;
                })}
            </ul>
          );
        }
        if (node.name === "span") {
          return (
            <h3 key={position} className={returnStyles.note}>
              {$(node).text().trim()}
            </h3>
          );
        }
        if (node.name === "div") {
          const lines = $(node)
            .children("span")
            .contents()
            .toArray()
            .flatMap((part) =>
              part.type === "text" && part.data.trim() ? [part.data.trim()] : [],
            );
          const terms = $(node)
            .contents()
            .filter((_, part) => part.type === "text")
            .text()
            .trim();
          return (
            <Fragment key={position}>
              <address className={returnStyles.address}>
                {lines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </address>
              <p>{terms}</p>
            </Fragment>
          );
        }
        return null;
      });

    return { id: `clause-${index + 1}`, number: index + 1, heading: label, body };
  });
}

export async function generateMetadata(): Promise<Metadata> {
  if (!(await getImportedPolicy())) return getSourceMetadata(sourceProps);

  return {
    title,
    description:
      "นโยบาย SUNFORD เกี่ยวกับการยกเลิกคำสั่งซื้อ เงื่อนไขการเปลี่ยนและคืนสินค้า ขั้นตอนส่งคืน และการคืนเงิน",
  };
}

export default async function ReturnPolicyPage() {
  const clauses = await getImportedPolicy();
  if (!clauses) return <SourceContentPage {...sourceProps} />;

  const contents = (
    <nav aria-label="สารบัญนโยบายการยกเลิกและคืนสินค้า" className={styles.contents}>
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

  return (
    <NavigationBackground as="main" id="main-content" className={styles.page}>
      <article className={styles.report} aria-labelledby="return-policy-title">
        <header className={`${styles.heading} ${returnStyles.heading}`}>
          <h1 id="return-policy-title">{title}</h1>
        </header>

        <div className={styles.layout}>
          <aside className={styles.desktopContents}>
            <h2>สารบัญ</h2>
            {contents}
          </aside>
          <details className={styles.mobileContents}>
            <summary>สารบัญ</summary>
            {contents}
          </details>

          <div className={styles.clauses}>
            {clauses.map(({ id, number, heading, body }) => (
              <section key={id} id={id} className={styles.clause} tabIndex={-1}>
                <h2>
                  <span>{number}.</span>
                  {heading}
                </h2>
                {body}
              </section>
            ))}
            <nav className={styles.related} aria-label="บริการที่เกี่ยวข้องกับการคืนสินค้า">
              <Link href={sunford.warrantyPolicy}>
                {siteMenuLabel(sunford.warrantyPolicy, "เงื่อนไขรับประกัน")}
              </Link>
              <Link href={sunford.contact}>{siteMenuLabel(sunford.contact, "ติดต่อเรา")}</Link>
            </nav>
          </div>
        </div>
      </article>
    </NavigationBackground>
  );
}
