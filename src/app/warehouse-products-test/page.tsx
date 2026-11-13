import { getProducts } from "@/features/catalog/server/product-repository";
import { ProductImage } from "@/components/ui/product-image";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <main>
      <h1>สินค้าจาก Warehouse ที่เชื่อมกับเว็บไซต์</h1>
      <p>พบสินค้าทั้งหมด {products.length} รายการ</p>
      <div>
        {products.map((product) => (
          <article key={product.id}>
            <ProductImage src={product.image} alt={product.name} width={300} height={300} />
            <h2>{product.name}</h2>
            <p>รหัสสินค้า: {product.warehouseSku}</p>
            {product.warehouseUnit && <p>หน่วย: {product.warehouseUnit}</p>}
            <p>
              {product.price == null
                ? "สอบถามราคา"
                : `ราคา ${product.price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท (ก่อน VAT)`}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
