import { LookbookEntry } from './lookbook';

export const DEMO_SAMPLE_LOOKS: LookbookEntry[] = [
  {
    id: "sample_tet_ngu_than",
    timestamp: 1728550000000,
    gender: "female",
    itemIds: [
      "F_A_TOP_ao_ngu_than",
      "F_COMMON_BOTTOM_quan_lua_trang",
      "F_COMMON_SHOES_giay_vai_den",
      "F_COMMON_HEAD_tram_cai",
    ],
    sceneId: "tet",
    summary:
      "Cổ điển (Thuần cổ phục): 100% cổ phục truyền thống. Giữ trọn cốt cách, phom dáng và quy chuẩn trang nghiêm của người xưa. Thân trên trang trọng với Áo ngũ thân (Thời Nguyễn (thế kỷ 18–20)). Điểm xuyết trâm cài bạc quý phái, tổng thể hòa nhịp cùng không khí Tết.",
    remixLevel: 0,
    title: "Tết Hoàng Cung • Ngũ Thân Đoan Trang",
    imageData: "/assets/demo/sample_1_tet.jpg",
  },
  {
    id: "sample_hoi_an_remix",
    timestamp: 1728550010000,
    gender: "female",
    itemIds: [
      "F_B_TOP_ao_giao_linh",
      "F_MIX_BOTTOM_quan_hien_dai",
      "F_MIX_SHOES_giay_sneaker",
    ],
    sceneId: "doi-thuong",
    summary:
      "Đương đại (Remix phá cách): Giao thoa táo bạo giữa tà áo giao lĩnh cổ phong Đại Việt cùng quần ống rộng và giày sneaker trắng năng động. Diện mạo dạo phố Hội An phóng khoáng, đậm chất nghệ thuật của thế hệ trẻ.",
    remixLevel: 2,
    title: "Dạo Phố Hội An • Giao Lĩnh Cách Tân",
    imageData: "/assets/demo/sample_2_remix.jpg",
  },
  {
    id: "sample_ky_yeu_nhat_binh",
    timestamp: 1728550020000,
    gender: "female",
    itemIds: [
      "F_C_TOP_ao_nhat_binh",
      "F_B_BOTTOM_vay_dai",
      "F_COMMON_SHOES_giay_vai_den",
      "F_COMMON_HEAD_non_la",
    ],
    sceneId: "ky-yeu",
    summary:
      "Cổ điển (Thuần cổ phục): Lễ phục Áo Nhật Bình cung đình Huế quý phái với viền cổ ngũ sắc, kết hợp nón lá duyên dáng trong không gian kỷ yếu sân trường. Lưu dấu khoảnh khắc thanh xuân rạng rỡ và thiêng liêng.",
    remixLevel: 0,
    title: "Kỷ Yếu Sân Trường • Nhật Bình Thanh Xuân",
    imageData: "/assets/demo/sample_3_ky_yeu.jpg",
  },
];
