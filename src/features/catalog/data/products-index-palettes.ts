type CardArtwork = {
  palette: string;
  mask: string;
  showcasePhoto?: string;
};

// Each mask follows the silhouette of this exact Warehouse photo revision.
const artworkByImage: Readonly<Record<string, CardArtwork | undefined>> = {
  "/api/products/G106698/image?v=2026-11-18%2003%3A38%3A38.863088%2B00": {
    palette: "ocean",
    mask: "wps10ks-store-mask.svg",
  },
  "/api/products/G106377/image?v=2026-11-18%2003%3A28%3A19.086162%2B00": {
    palette: "honey",
    mask: "store-masks/g106377.svg",
  },
  "/api/products/G106582/image?v=2026-11-18%2004%3A39%3A04.385169%2B00": {
    palette: "amber",
    mask: "store-masks/g106582.svg",
  },
  "/images/warehouse-cache/4c117e0c806709ffbf2566fbee5780da3b25d238f5a1ab98a7dd6360c4ac8e1b.webp?v=2026-09-23%2015%3A59%3A21.675732%2B00":
    { palette: "ocean", mask: "store-masks/g106483.svg" },
  "/images/warehouse-cache/3f5d1b5ab0ffc49aedd2ec4edf86687fb8c7906cbdb1bcbf15d0f45b3c5f1a41.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mint", mask: "store-masks/g106513.svg" },
  "/images/warehouse-cache/4c172be89857466d1696b0c5dd2132ec097616429090c509bb8eadf16d6721db.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "rose", mask: "store-masks/g107244.svg" },
  "/api/products/G106681/image?v=2026-11-18%2007%3A34%3A15.356593%2B00": {
    palette: "lilac",
    mask: "store-masks/g106681.svg",
    showcasePhoto: "/images/products/scale-showcase/g106681-front-4k.webp",
  },
  "/api/products/G106247/image?v=2026-11-18%2007%3A35%3A24.184083%2B00": {
    palette: "sage",
    mask: "store-masks/g106247.svg",
  },
  "/api/products/G106674/image?v=2026-11-18%2007%3A34%3A59.704634%2B00": {
    palette: "sand",
    mask: "store-masks/g106674.svg",
  },
  "/api/products/G106469/image?v=2026-11-18%2006%3A04%3A32.318183%2B00": {
    palette: "rose",
    mask: "store-masks/g106469.svg",
  },
  "/images/warehouse-cache/7716f940537064386f6a96804296e16218adf6a8b2f7fdb7ac853cc7fe08a0d5.webp?v=2026-11-03%2008%3A46%3A53.977486%2B00":
    { palette: "mist", mask: "store-masks/g106643.svg" },
  "/images/warehouse-cache/beaa801a2fd9ddf6d417799944ea4d401b2746ef46e1f532f734cf5f0136e430.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    {
      palette: "mist",
      mask: "store-masks/g106650.svg",
      showcasePhoto: "/images/products/scale-showcase/g106650-front-4k.webp",
    },
  "/images/warehouse-cache/39809329172325c42f4869da11488c424a22355cc4bd514d3a87be52eaa4d8c9.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mist", mask: "store-masks/g106803.svg" },
  "/images/warehouse-cache/fcfb7f06bd58457b0ec9baa391fa63411d5356d69687428e4cf9cd9f665c0f76.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mist", mask: "store-masks/g106810.svg" },
  "/images/warehouse-cache/822fcf63b4815be01a8eadf5159badeb94e3417589802433d4d92a0f5d550d26.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "rose", mask: "store-masks/g106612.svg" },
  "/images/warehouse-cache/50d1a920ffea291d8bbff30da7f0dcb70c979a21614035465654292ed90f8c52.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "rose", mask: "store-masks/g106629.svg" },
  "/images/warehouse-cache/9b73268a707bbb9d1fefe5e0ee7fda08e92925c1ea7e17af82f63590e16e2514.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mist", mask: "store-masks/g106667.svg" },
  "/api/products/G106148/image?v=2026-11-18%2002%3A38%3A25.696653%2B00": {
    palette: "rose",
    mask: "store-masks/g106148.svg",
  },
  "/images/warehouse-cache/2c450fe9fff209c036c6c4a28830e7819a585229c2b5aa0b54dd9551a64b2c9c.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "rose", mask: "store-masks/g106438.svg" },
  "/api/products/G106742/image?v=2026-11-18%2003%3A37%3A10.299519%2B00": {
    palette: "sage",
    mask: "store-masks/g106742.svg",
    showcasePhoto: "/images/products/scale-showcase/g106742-front-4k.webp",
  },
  "/api/products/G106414/image?v=2026-11-18%2003%3A33%3A20.373782%2B00": {
    palette: "rose",
    mask: "store-masks/g106414.svg",
    showcasePhoto: "/images/products/scale-showcase/g106414-front-4k.webp",
  },
  "/images/warehouse-cache/d6aed0a228ca49d5f3ed1a615db0d91f8c244ab49d2ec31915f81bd31efd4cc1.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "rose", mask: "store-masks/g106568.svg" },
  "/api/products/G106209/image?v=2026-11-18%2003%3A55%3A55.148898%2B00": {
    palette: "rose",
    mask: "store-masks/g106209.svg",
    showcasePhoto: "/images/products/scale-showcase/g106209-front-4k.webp",
  },
  "/api/products/G106407/image?v=2026-11-18%2004%3A17%3A34.38277%2B00": {
    palette: "mist",
    mask: "store-masks/g106407.svg",
  },
  "/images/warehouse-cache/0e817f4f011f6fb23fe74b2c29b85f754a611b517a15cbae056d20125478377c.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mist", mask: "store-masks/g108012.svg" },
  "/images/warehouse-cache/e41794a474a60cb77a069e1fbcff19d923303df981b9079e0029637d4ba7c694.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "amber", mask: "store-masks/g108029.svg" },
  "/images/warehouse-cache/41177b69e65dce4ebab82279ce1d7b86b7c57a61092e02f78ab5d7e912c2be29.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "rose", mask: "store-masks/g108050.svg" },
  "/api/products/G107268/image?v=2026-11-18%2007%3A55%3A45.146106%2B00": {
    palette: "sand",
    mask: "store-masks/g107268.svg",
  },
  "/api/products/G107411/image?v=2026-11-18%2007%3A56%3A02.894375%2B00": {
    palette: "lilac",
    mask: "store-masks/g107411.svg",
  },
  "/api/products/G106735/image?v=2026-11-18%2003%3A33%3A55.321064%2B00": {
    palette: "mint",
    mask: "store-masks/g106735.svg",
  },
  "/api/products/G106353/image?v=2026-11-18%2003%3A39%3A21.207666%2B00": {
    palette: "honey",
    mask: "store-masks/g106353.svg",
  },
  "/api/products/G106711/image?v=2026-11-18%2003%3A39%3A05.704108%2B00": {
    palette: "ocean",
    mask: "store-masks/g106711.svg",
  },
  "/api/products/G106704/image?v=2026-11-18%2003%3A32%3A21.234254%2B00": {
    palette: "amber",
    mask: "store-masks/g106704.svg",
  },
  "/api/products/G106308/image?v=2026-11-18%2007%3A30%3A23.883119%2B00": {
    palette: "sage",
    mask: "store-masks/g106308.svg",
    showcasePhoto: "/images/products/scale-showcase/g106308-front-4k.webp",
  },
  "/api/products/G106551/image?v=2026-11-18%2004%3A23%3A29.662722%2B00": {
    palette: "mint",
    mask: "store-masks/g106551.svg",
  },
  "/api/products/G106346/image?v=2026-11-18%2007%3A29%3A24.948085%2B00": {
    palette: "ocean",
    mask: "store-masks/g106346.svg",
  },
  "/images/warehouse-cache/387a4d0db85a2e9caf2f5d9a987938f4ab5be277fa2b51b33481f7af0366b2e9.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "ocean", mask: "store-masks/g106384.svg" },
  "/api/products/G106360/image?v=2026-11-18%2004%3A26%3A27.028253%2B00": {
    palette: "ocean",
    mask: "store-masks/g106360.svg",
  },
  "/api/products/G106544/image?v=2026-11-18%2004%3A04%3A24.634246%2B00": {
    palette: "sand",
    mask: "store-masks/g106544.svg",
  },
  "/api/products/G106537/image?v=2026-11-18%2004%3A03%3A53.069602%2B00": {
    palette: "sage",
    mask: "store-masks/g106537.svg",
    showcasePhoto: "/images/products/scale-showcase/g106537-front-4k.webp",
  },
  "/api/products/G106599/image?v=2026-11-18%2004%3A39%3A13.286638%2B00": {
    palette: "ocean",
    mask: "store-masks/g106599.svg",
  },
  "/api/products/G106070/image?v=2026-11-18%2003%3A18%3A18.549487%2B00": {
    palette: "honey",
    mask: "store-masks/g106070.svg",
  },
  "/api/products/G106094/image?v=2026-11-18%2001%3A52%3A03.689114%2B00": {
    palette: "rose",
    mask: "store-masks/g106094.svg",
  },
  "/api/products/G106124/image?v=2026-11-18%2003%3A34%3A50.921421%2B00": {
    palette: "honey",
    mask: "store-masks/g106124.svg",
  },
  "/images/warehouse-cache/48013c2a3303d7e6c3fa68c71eda6dd4a7771b39754cd5ab518851b7af437b11.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "honey", mask: "store-masks/g106131.svg" },
  "/api/products/G106155/image?v=2026-11-18%2007%3A28%3A41.489502%2B00": {
    palette: "lilac",
    mask: "store-masks/g106155.svg",
  },
  "/api/products/G106162/image?v=2026-11-18%2003%3A57%3A14.573918%2B00": {
    palette: "ocean",
    mask: "store-masks/g106162.svg",
  },
  "/api/products/G106179/image?v=2026-11-18%2003%3A40%3A46.948208%2B00": {
    palette: "sand",
    mask: "store-masks/g106179.svg",
  },
  "/api/products/G106186/image?v=2026-11-18%2002%3A43%3A10.201094%2B00": {
    palette: "rose",
    mask: "store-masks/g106186.svg",
    showcasePhoto: "/images/products/scale-showcase/g106186-front-4k.webp",
  },
  "/api/products/G106193/image?v=2026-11-18%2003%3A17%3A12.851081%2B00": {
    palette: "rose",
    mask: "store-masks/g106193.svg",
  },
  "/api/products/G106216/image?v=2026-11-18%2003%3A32%3A09.846101%2B00": {
    palette: "rose",
    mask: "store-masks/g106216.svg",
  },
  "/api/products/G106254/image?v=2026-11-18%2003%3A41%3A35.326528%2B00": {
    palette: "mint",
    mask: "store-masks/g106254.svg",
  },
  "/api/products/G106285/image?v=2026-11-18%2003%3A39%3A37.925246%2B00": {
    palette: "lilac",
    mask: "store-masks/g106285.svg",
  },
  "/images/warehouse-cache/95fecad69639f9f828ba89b9419d54aa64c2ab637f279ad9a992b63bf72bb2f3.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    {
      palette: "sand",
      mask: "store-masks/g106292.svg",
      showcasePhoto: "/images/products/scale-showcase/g106292-front-4k.webp",
    },
  "/api/products/G106315/image?v=2026-11-18%2002%3A39%3A46.155512%2B00": {
    palette: "rose",
    mask: "store-masks/g106315.svg",
  },
  "/api/products/G106322/image?v=2026-11-18%2003%3A35%3A48.324133%2B00": {
    palette: "rose",
    mask: "store-masks/g106322.svg",
  },
  "/images/warehouse-cache/e8ac894c68d1c59a7313709b6d382043a0c43913b5b09aba435efc36e2131de9.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "ocean", mask: "store-masks/g106339.svg" },
  "/images/warehouse-cache/fbf75272a2461fdefe593b8979bba027f5c963d46cf5129909af13d7c68f6300.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "sage", mask: "store-masks/g106421.svg" },
  "/images/warehouse-cache/95815ee45fb21fc456372c066690a93a0f73868a06c61f86e45889ef4d66b6ec.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "ocean", mask: "store-masks/g106476.svg" },
  "/images/warehouse-cache/a158b9fff59c747aa3313b93e928a95e615d5534047508c18445ebf9d60001aa.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "ocean", mask: "store-masks/g106490.svg" },
  "/images/warehouse-cache/6e44c6010e4513e8c097e0df64ee875429ff75854cb8218f0705f4efd8b937a9.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mist", mask: "store-masks/g106636.svg" },
  "/api/products/G106728/image?v=2026-11-18%2002%3A55%3A26.347928%2B00": {
    palette: "mint",
    mask: "store-masks/g106728.svg",
  },
  "/api/products/G106827/image?v=2026-11-13%2003%3A32%3A40.913527%2B00": {
    palette: "ocean",
    mask: "store-masks/g106827.svg",
  },
  "/api/products/G106834/image?v=2026-11-18%2003%3A37%3A03.554166%2B00": {
    palette: "sage",
    mask: "store-masks/g106834.svg",
  },
  "/images/warehouse-cache/5e5d62e4161ea0c1c0bcc89701243392b800e2d30afff149abd158aead579865.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "sage", mask: "store-masks/g106841.svg" },
  "/images/warehouse-cache/b00dc325d59d366802076841d49b193fe3feabd82149365d60ef095b037b71a1.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mint", mask: "store-masks/g106858.svg" },
  "/images/warehouse-cache/73ad4c752c29c9de64c7e5c126949bf087dc15ce4a1a75c58c138b1fe4df968c.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "lilac", mask: "store-masks/g106865.svg" },
  "/images/warehouse-cache/c253791bfd26455fd127647d8a765d64f84e363892794367b12f55471099ee9c.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "lilac", mask: "store-masks/g106872.svg" },
  "/api/products/G106889/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "lilac",
    mask: "store-masks/g106889.svg",
  },
  "/api/products/G106902/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "lilac",
    mask: "store-masks/g106902.svg",
  },
  "/api/products/G106919/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "lilac",
    mask: "store-masks/g106919.svg",
  },
  "/api/products/G106926/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "lilac",
    mask: "store-masks/g106926.svg",
  },
  "/images/warehouse-cache/8c0f0e7b0c744c2dea6cbc8e4c481490aaf71e03c5560415a0ad460bdbc56763.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "sage", mask: "store-masks/g106940.svg" },
  "/images/warehouse-cache/d9770dd9d825f1d9594188c361d75ca8f1f63d5b6678fa10585e459b22233c4c.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "amber", mask: "store-masks/g107169.svg" },
  "/images/warehouse-cache/6e8c7a3cd3ddad8864f2ac71fb975515be662c9895f9fc24ca5f452cf7a2e912.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mist", mask: "store-masks/g107213.svg" },
  "/api/products/G107237/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "rose",
    mask: "store-masks/g107237.svg",
  },
  "/api/products/G107251/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "rose",
    mask: "store-masks/g107251.svg",
  },
  "/api/products/G107282/image?v=2026-11-18%2007%3A34%3A30.851543%2B00": {
    palette: "amber",
    mask: "store-masks/g107282.svg",
  },
  "/api/products/G107305/image?v=2026-11-18%2007%3A34%3A47.540113%2B00": {
    palette: "lilac",
    mask: "store-masks/g107305.svg",
  },
  "/api/products/G107312/image?v=2026-11-18%2007%3A35%3A12.328301%2B00": {
    palette: "sage",
    mask: "store-masks/g107312.svg",
  },
  "/images/warehouse-cache/7892ac576722d01dba5bdfabec3242b81f5d744de6ab4080d9e4e02d0b069306.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "amber", mask: "store-masks/g108043.svg" },
  "/api/products/G108531/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "ocean",
    mask: "store-masks/g108531.svg",
  },
  "/api/products/G108548/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "rose",
    mask: "store-masks/g108548.svg",
  },
  "/api/products/G108555/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "ocean",
    mask: "store-masks/g108555.svg",
  },
  "/api/products/G108562/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "ocean",
    mask: "store-masks/g108562.svg",
    showcasePhoto: "/images/products/scale-showcase/g108562-front-4k.webp",
  },
  "/api/products/G108572/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "mint",
    mask: "store-masks/g108572.svg",
  },
  "/api/products/G108616/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "sage",
    mask: "store-masks/g108616.svg",
  },
  "/api/products/G108623/image?v=2026-11-18%2007%3A34%3A01.832827%2B00": {
    palette: "sage",
    mask: "store-masks/g108623.svg",
  },
  "/api/products/G108630/image?v=2026-11-18%2003%3A58%3A14.131348%2B00": {
    palette: "amber",
    mask: "store-masks/g108630.svg",
  },
  "/api/products/G108647/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "sage",
    mask: "store-masks/g108647.svg",
  },
  "/api/products/G108654/image?v=2026-11-18%2004%3A25%3A30.986339%2B00": {
    palette: "ocean",
    mask: "store-masks/g108654.svg",
  },
  "/api/products/G108661/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "sand",
    mask: "store-masks/g108661.svg",
  },
  "/api/products/G108678/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "mint",
    mask: "store-masks/g108678.svg",
  },
  "/api/products/G108692/image?v=2026-09-05%2018%3A57%3A35.432884%2B00": {
    palette: "sand",
    mask: "store-masks/g108692.svg",
  },
  "/api/products/G108746/image?v=2026-11-19%2003%3A06%3A43.342077%2B00": {
    palette: "mint",
    mask: "store-masks/g108746.svg",
  },
  "/images/warehouse-cache/bcdca7b85bf5bf5833522d82d883b47e0d3c91bac88bc0ff0939dd1041a4a35e.webp?v=2026-09-05%2018%3A57%3A35.432884%2B00":
    { palette: "mint", mask: "store-masks/g108753.svg" },
  "/api/products/IMP-00297/image?v=2026-11-18%2004%3A30%3A15.564164%2B00": {
    palette: "mint",
    mask: "store-masks/imp-00297.svg",
  },
};

export function productsIndexArtwork(image: string) {
  return artworkByImage[image];
}
