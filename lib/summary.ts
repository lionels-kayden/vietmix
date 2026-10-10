import { Outfit, Scene, Preset, Item } from './types';
import { getItem } from './data';
import { remixLevel } from './remix';
import { getPresetStory, getRemixLevelStory, getItemStory } from './stories';
import { evaluate } from './rules';

export const PRESET_SCENE_NARRATIVES: Record<string, Record<string, string>> = {
  'set-a-male': {
    'tet': 'Bộ ngũ thân tay chẽn truyền thống thời Nguyễn: áo năm thân kết hợp quần lụa trắng và hài vải đen chuẩn mực nho nhã. Phối cùng không gian Tết Hoàng Cung rực rỡ sắc mai đào và đèn lồng đỏ Đại Nội, bộ trang phục toát lên phong thái trang trọng, thanh cao đón mừng năm mới an khang.',
    'ky-yeu': 'Bộ ngũ thân tay chẽn truyền thống thời Nguyễn: tà áo ngũ thân ngũ thường kết hợp quần lụa trắng và hài vải đen. Đứng trước hành lang vòm kiến trúc Indochine trường Quốc Học Huế, trang phục tôn vinh vẻ đẹp tri thức, mực thước và lưu giữ khoảnh khắc kỷ yếu thanh xuân vàng son.',
    'le-hoi': 'Bộ ngũ thân tay chẽn truyền thống thời Nguyễn: thiết kế năm thân tượng trưng cho tứ thân phụ mẫu và đạo làm người, đi cùng quần lụa trắng và hài vải đen. Giữa không gian Lễ Hội Đình Làng uy nghiêm với cờ ngũ sắc và trống đồng, bộ cổ phục giữ trọn sự tôn kính với tiên tổ.',
    'doi-thuong': 'Bộ ngũ thân tay chẽn truyền thống thời Nguyễn: tà áo xanh trang nhã buông nhẹ trên nền quần lụa trắng và hài vải đen. Dạo bước qua không gian Đời Thường Phố Cổ Hội An bên giàn hoa giấy và bức tường vàng rêu phong, trang phục mang lại cảm giác an yên, phong lưu tự tại.',
  },
  'set-a-female': {
    'tet': 'Nét đoan trang dịu dàng của thiếu nữ Huế trong tà áo ngũ thân lập lĩnh, quần lụa trắng thướt tha và hài vải đen truyền thống. Phối cùng không gian Tết Hoàng Cung Đại Nội rực rỡ cành mai đào, bộ cổ phục tỏa sáng vẻ đẹp đài các, thanh lịch ngày xuân.',
    'ky-yeu': 'Tà áo ngũ thân thời Nguyễn kết hợp quần lụa trắng và hài vải đen đoan trang. Dưới bóng mát sân trường và tán phượng vĩ Kỷ Yếu Quốc Học, dáng áo ngũ thân tôn vinh nét e ấp, dịu hiền của thiếu nữ đất cố đô trong tà áo di sản.',
    'le-hoi': 'Tà áo ngũ thân năm vạt kín đáo, tượng trưng cho đạo hiếu nghĩa tứ thân phụ mẫu, kết hợp quần lụa trắng thuần khiết. Trong ngày Lễ Hội Đình Làng trang nghiêm, bộ trang phục thể hiện trọn vẹn nét thuần phong mỹ tục của người phụ nữ Việt xưa.',
    'doi-thuong': 'Áo ngũ thân truyền thống đi cùng quần lụa trắng và hài vải bước đi khoan thai giữa không gian Đời Thường Phố Cổ. Nét đằm thắm cổ truyền hòa vào giàn hoa giấy tím và tường vàng rêu phong tạo nên vẻ đẹp thuần khiết, lắng đọng.',
  },
  'set-b-male': {
    'tet': 'Bộ giao lĩnh vạt chéo thời Lê cổ phong phóng khoáng, tái hiện phong thái văn sĩ kinh thành Thăng Long xưa. Khi diện trong không gian Tết Hoàng Cung thềm son Đại Nội, vạt áo chéo đan cài hài hòa cùng cành đào bích, mang lại không khí đón xuân hoài cổ đầy thi vị.',
    'ky-yeu': 'Bộ giao lĩnh vạt chéo thời Lê với phong thái tự do, bay bổng của tao nhân mặc khách đất Thăng Long. Hòa mình vào không gian Kỷ Yếu Quốc Học dưới bóng phượng vĩ đỏ rực, bộ trang phục tạo nên nét hoài niệm thanh nhã, tôn bật vẻ đẹp thuần Việt độc đáo.',
    'le-hoi': 'Bộ giao lĩnh vạt chéo thời Lê thướt tha mang đậm dấu ấn lịch sử hào hùng. Giữa không gian Lễ Hội Đình Làng rộn rã tiếng chiêng trống và hương trầm ngào ngạt, tà áo giao lĩnh thể hiện nét đẹp tâm linh gắn kết và lòng tự hào văn hiến nghìn năm.',
    'doi-thuong': 'Bộ giao lĩnh vạt chéo thời Lê cổ kính, phóng khoáng kết hợp hài hòa trong nhịp sống Đời Thường Phố Cổ. Dưới ánh lồng đèn lụa ấm áp và những mái ngói âm dương Hội An, từng bước chân chậm rãi toát lên khí chất thanh tao, bình dị.',
  },
  'set-b-female': {
    'tet': 'Giao lĩnh nữ kết hợp váy dài đen thời Lê, nét đẹp đoan chính, cổ kính của người phụ nữ Thăng Long nghìn năm. Hòa cùng sắc đỏ thềm gạch son và đèn lồng Tết Hoàng Cung, vạt áo chéo buông rủ mang lại nét đài các, vương giả đón chào xuân mới.',
    'ky-yeu': 'Bộ giao lĩnh và chân váy dài đen cổ điển thời Lê tạo nên dấu ấn hoài cổ đặc biệt giữa khung cảnh Kỷ Yếu Quốc Học. Sắc áo trang nhã nổi bật trên nền kiến trúc vòm Đông Dương, lưu giữ vẻ đẹp thanh xuân trầm lắng và chiều sâu văn hóa.',
    'le-hoi': 'Áo giao lĩnh phối chân váy dài đen là biểu tượng cổ phục tiêu biểu của phụ nữ Bắc Bộ thời Lê trong ngày hội làng. Giữa không gian Lễ Hội Đình Làng linh thiêng với cờ ngũ sắc và Trống Đồng, bộ cánh toát lên khí chất tôn nghiêm, thuần hậu.',
    'doi-thuong': 'Giao lĩnh cổ chéo mềm mại đi cùng chân váy dài đen bước đi duyên dáng trên đường đá Đời Thường Phố Cổ. Khung cảnh tường vàng hoa giấy Hội An làm bừng sáng nét duyên dáng, kín đáo của người thiếu nữ xưa.',
  },
  'set-c-male': {
    'tet': 'Lễ phục áo tấc tay thụng trang nghiêm triều Nguyễn, đại diện cho lòng kính cẩn trong các đại lễ hoàng gia. Trong không gian Tết Hoàng Cung Đại Nội dưới trăng rằm, tà áo tấc rộng thụng uy nghi khẳng định cốt cách bậc trượng phu đất kinh kỳ.',
    'ky-yeu': 'Áo tấc tay thụng là lễ phục quy chuẩn triều Nguyễn, thể hiện lòng thành kính và sự đĩnh đạc. Trong khung cảnh Kỷ Yếu Quốc Học Huế, bộ lễ phục tạo nên bức ảnh kỷ yếu trường tồn, tôn vinh truyền thống hiếu học và trọng đạo.',
    'le-hoi': 'Lễ phục áo tấc tay thụng thời Nguyễn là đỉnh cao của sự tôn nghiêm khi tế lễ tiên tổ. Đứng trước đình làng cổ kính trong ngày Lễ Hội Đình Làng, tà áo thụng rộng một tấc thể hiện sự mực thước, uy nghiêm trước anh linh tiên hiền.',
    'doi-thuong': 'Áo tấc tay thụng triều Nguyễn mang phong thái vương giả, uy nghiêm nổi bật trên nền Đời Thường Phố Cổ Hội An. Sự đối chiếu giữa nét nghi lễ cung đình và mái ngói rêu phong tạo nên vẻ đẹp điện ảnh đầy ấn tượng.',
  },
  'set-c-female': {
    'tet': 'Lễ phục cung đình áo nhật bình lộng lẫy, vương giả của bậc phi tần, công chúa triều đại phong kiến cuối cùng. Giữa không gian Tết Hoàng Cung thềm son rực rỡ hoa mai đào, dải viền cổ áo ngũ hành lấp lánh tôn vinh khí chất cao quý bậc nhất.',
    'ky-yeu': 'Áo nhật bình cung đình Huế với hoa văn dải cổ hình chữ nhật trang trọng và quý phái. Đặt trong khung cảnh Kỷ Yếu Quốc Học, bộ lễ phục mang đến khoảnh khắc lưu niệm tuyệt mỹ, đầy tự hào về di sản mỹ thuật hoàng gia.',
    'le-hoi': 'Áo nhật bình triều đình với sắc đỏ son uy nghi và họa tiết thêu cổ truyền. Trong không gian Lễ Hội Đình Làng thiêng liêng rực rỡ cờ hoa, bộ lễ phục thể hiện trọn vẹn sự tôn quý và lòng tự hào nguồn cội dân tộc.',
    'doi-thuong': 'Tà áo nhật bình lộng lẫy cung đình thả dáng bên góc tường vàng rêu phong Đời Thường Phố Cổ Hội An, tạo nên bức tranh hoài niệm di sản giao hòa giữa nét vương giả cố đô và sự mộc mạc phố hội.',
  },
  'rx-01-male': {
    'tet': 'Bản phối cách tân đột phá: áo ngũ thân cổ truyền hòa quyện cùng quần âu màu be và giày sneaker năng động Gen Z. Trong không khí Tết Hoàng Cung rực rỡ, set đồ vừa giữ được nét tôn kính cội nguồn vừa tạo sự tươi mới, nhẹ nhàng khi du xuân chúc Tết.',
    'ky-yeu': 'Bản phối cách tân đột phá: áo ngũ thân cổ truyền hòa quyện cùng quần âu màu be và giày sneaker năng động Gen Z. Không gian Kỷ Yếu Quốc Học là bệ phóng hoàn hảo cho phong cách học đường hiện đại: trẻ trung, tự tin nhưng luôn tự hào với bản sắc cội nguồn.',
    'le-hoi': 'Bản phối cách tân đột phá: áo ngũ thân cổ truyền đi cùng quần âu màu be và sneaker êm ái. Giữa dòng người trẩy hội Lễ Hội Đình Làng, bạn vừa giữ được nét nho nhã cổ truyền, vừa thỏa sức dạo bước suốt ngày dài lễ hội sôi động.',
    'doi-thuong': 'Bản phối cách tân đột phá: áo ngũ thân cổ truyền hòa quyện cùng quần âu màu be và giày sneaker năng động Gen Z. Rất thích hợp cho buổi cà phê dạo phố Đời Thường Phố Cổ, đưa cổ phục Việt hòa nhập tự nhiên vào phong cách thời trang đường phố.',
  },
  'rx-01-female': {
    'tet': 'Bản phối cách tân đột phá: áo ngũ thân lập lĩnh kết hợp quần âu ống rộng màu be và giày sneaker trắng năng động. Giữa không gian Tết Hoàng Cung tràn ngập sắc xuân, bộ cánh đem lại vẻ đẹp thiếu nữ hiện đại, thanh thoát và tự tin.',
    'ky-yeu': 'Vẻ đẹp tri thức đương đại: kết hợp Áo ngũ thân cùng quần âu thanh lịch và giày thể thao trắng trẻ trung. Trong khuôn viên Kỷ Yếu Quốc Học, đây là bản phối thanh xuân hoàn hảo, vừa giữ cốt cách nữ sinh vừa bắt kịp xu hướng thời trang quốc tế.',
    'le-hoi': 'Bản phối cách tân đột phá: tà áo ngũ thân nền nã song hành cùng quần âu màu be và giày sneaker trắng. Bước chân êm ái, linh hoạt giúp bạn tận hưởng trọn vẹn ngày Lễ Hội Đình Làng rộn rã mà vẫn thanh lịch.',
    'doi-thuong': 'Áo ngũ thân kết hợp quần âu màu be và sneaker trắng là lựa chọn tuyệt vời cho ngày dạo chơi Đời Thường Phố Cổ. Nét hoài cổ của tà áo hòa cùng sự phóng khoáng của quần âu tạo nên dấu ấn cá nhân đậm nét bên phố Hội.',
  },
  'rx-02-male': {
    'tet': 'Giao thoa táo bạo giữa áo giao lĩnh cổ chéo, kiềng bạc cá tính và phụ kiện đường phố thời thượng. Sắc đỏ thềm son Tết Hoàng Cung phản chiếu ánh sáng kiềng bạc lấp lánh, mang đến một diện mạo du xuân vương giả nhưng đậm chất thời trang hiện đại.',
    'ky-yeu': 'Giao thoa táo bạo giữa áo giao lĩnh cổ chéo, kiềng bạc cá tính và phụ kiện đường phố thời thượng. Dưới tán phượng vĩ đỏ rực của Kỷ Yếu Quốc Học, bộ cánh khẳng định cá tính tự do, phóng khoáng của thế hệ trẻ yêu di sản.',
    'le-hoi': 'Giao thoa táo bạo giữa áo giao lĩnh cổ chéo, kiềng bạc cá tính và phụ kiện đường phố thời thượng. Điểm xuyết nét tinh hoa chạm khắc bạc truyền thống giữa Lễ Hội Đình Làng, tạo nên một phong cách ấn tượng và nổi bật giữa ngày hội.',
    'doi-thuong': 'Giao thoa táo bạo giữa áo giao lĩnh cổ chéo, kiềng bạc cá tính và phụ kiện đường phố thời thượng. Chiếc kiềng bạc sáng bừng trên tà áo buông rủ cùng giày sneaker dạo bước Đời Thường Phố Cổ tạo nên vẻ đẹp phiêu lãng, thời thượng.',
  },
  'rx-02-female': {
    'tet': 'Bộ cánh giao lĩnh cách tân kết hợp quần âu, sneaker và kiềng bạc, thể hiện cá tính tự do của thiếu nữ hiện đại. Trong không gian Tết Hoàng Cung rực rỡ, ánh kiềng bạc lấp lánh cùng vạt áo bay nhẹ mang lại vẻ đẹp kiêu sa, cuốn hút ngày đầu năm.',
    'ky-yeu': 'Áo giao lĩnh phối cùng kiềng bạc truyền thống, quần âu màu be và sneaker trắng thời thượng. Tỏa sáng rực rỡ trong bộ ảnh Kỷ Yếu Quốc Học, khẳng định bản lĩnh và tư duy thẩm mỹ độc đáo của thiếu nữ đương đại.',
    'le-hoi': 'Nét phá cách ấn tượng: áo giao lĩnh cổ chéo đi cùng kiềng bạc chạm hoa văn và sneaker hiện đại. Giữa Lễ Hội Đình Làng tưng bừng, phong cách phối đồ thể hiện sự giao thoa nhuần nhuyễn giữa truyền thống và hơi thở thời đại.',
    'doi-thuong': 'Bộ cánh giao lĩnh cách tân kết hợp quần âu, sneaker và kiềng bạc dạo phố Đời Thường Phố Cổ Hội An. Một phong cách đậm chất lookbook nghệ thuật, nổi bật rạng ngời bên những giàn hoa giấy tím hồng.',
  },
  'rx-03-male': {
    'tet': 'Cách tân nhẹ nhàng đầy tinh tế: giữ nguyên áo ngũ thân chuẩn mực và quần lụa trắng thướt tha, thay hài vải bằng sneaker trắng tinh khôi. Trong không khí Tết Hoàng Cung, bộ cánh đem lại sự thoải mái tối đa cho ngày đầu năm mới du xuân.',
    'ky-yeu': 'Cách tân nhẹ nhàng đầy tinh tế: áo ngũ thân tay chẽn và quần lụa trắng nho nhã đi cùng đôi sneaker trắng năng động. Lựa chọn lý tưởng cho bộ ảnh Kỷ Yếu Quốc Học: đoan trang, hoài niệm nhưng linh hoạt trong từng bước chạy tuổi học trò.',
    'le-hoi': 'Cách tân nhẹ nhàng đầy tinh tế: tà áo ngũ thân và quần lụa trắng truyền thống phối cùng sneaker trắng êm ái. Vừa đoan chính trước cửa đình tôn nghiêm Lễ Hội Đình Làng, vừa vững bước trẩy hội mùa xuân suốt ngày dài.',
    'doi-thuong': 'Cách tân nhẹ nhàng đầy tinh tế: áo ngũ thân và quần lụa trắng mềm mại kết hợp giày thể thao trắng. Dạo bước thong dong giữa không gian Đời Thường Phố Cổ Hội An, mang nét đẹp cổ truyền len lỏi vào từng nhịp thở đời thường.',
  },
  'rx-04-male': {
    'tet': 'Bản phối cách tân tao nhã: áo giao lĩnh vạt chéo kết hợp quần lụa trắng và giày sneaker trắng. Hòa vào không gian Tết Hoàng Cung tráng lệ, set đồ toát lên thần thái phóng khoáng, thanh nhã của bậc tài tử đón xuân.',
    'ky-yeu': 'Bản phối cách tân tao nhã: áo giao lĩnh vạt chéo kết hợp quần lụa trắng và giày sneaker trắng. Gợi nhắc hình ảnh thư sinh thanh xuân dưới tán phượng vĩ Kỷ Yếu Quốc Học, kết nối trọn vẹn giữa quá khứ và hiện tại.',
    'le-hoi': 'Bản phối cách tân tao nhã: áo giao lĩnh vạt chéo kết hợp quần lụa trắng và giày sneaker trắng. Nét hoài cổ thanh lịch giúp bạn tự tin hòa nhịp cùng không khí tưng bừng của Lễ Hội Đình Làng.',
    'doi-thuong': 'Bản phối cách tân tao nhã: áo giao lĩnh vạt chéo kết hợp quần lụa trắng và giày sneaker trắng. Phong thái tự do, phong nhã hoàn hảo cho những buổi chiều dạo bước thưởng trà nơi Đời Thường Phố Cổ.',
  },
  'rx-03-female': {
    'tet': 'Nét duyên dáng giao thoa: áo giao lĩnh cổ chéo kết hợp chân váy dài đen thời Lê và giày sneaker trắng êm ái. Tà áo rủ mềm mại trên nền thềm son Tết Hoàng Cung, mang lại vẻ đoan trang ngọt ngào cho thiếu nữ du xuân.',
    'ky-yeu': 'Nét duyên dáng giao thoa: áo giao lĩnh cổ chéo kết hợp chân váy dài đen thời Lê và giày sneaker trắng êm ái. Khung cảnh Kỷ Yếu Quốc Học tôn vinh nét đẹp nữ sinh trong trẻo, thơ mộng và tràn ngập hơi thở thanh xuân.',
    'le-hoi': 'Nét duyên dáng giao thoa: áo giao lĩnh cổ chéo kết hợp chân váy dài đen thời Lê và giày sneaker trắng êm ái. Từng bước chân dạo hội làng vừa uyển chuyển duyên dáng vừa năng động, hòa nhịp cùng không khí Lễ Hội Đình Làng tưng bừng.',
    'doi-thuong': 'Nét duyên dáng giao thoa: áo giao lĩnh cổ chéo kết hợp chân váy dài đen thời Lê và giày sneaker trắng êm ái. Chân váy bay nhẹ trong gió Đời Thường Phố Cổ Hội An, đôi sneaker trắng tạo điểm tựa trẻ trung bên những góc quán quen.',
  },
  'rx-04-female': {
    'tet': 'Cách tân nhẹ nhàng đầy tinh tế: giữ nguyên áo ngũ thân chuẩn mực và quần lụa trắng thướt tha, phối cùng giày sneaker trắng trẻ trung. Trong không khí Tết Hoàng Cung rực rỡ, bộ cánh đem lại sự thoải mái, trang nhã cho ngày đầu năm mới.',
    'ky-yeu': 'Cách tân nhẹ nhàng đầy tinh tế: áo ngũ thân dịu dàng và quần lụa trắng đi cùng giày sneaker trắng tinh khôi. Sự kết hợp hoàn hảo cho ngày Kỷ Yếu Quốc Học: lưu giữ nét thanh xuân đoan trang nhưng tràn đầy sức sống tươi trẻ.',
    'le-hoi': 'Cách tân nhẹ nhàng đầy tinh tế: áo ngũ thân và quần lụa trắng phối sneaker trắng. Vừa giữ trọn lễ nghi đoan chính trong ngày Lễ Hội Đình Làng, vừa giúp thiếu nữ thoải mái bước đi thưởng ngoạn các trò hội dân gian.',
    'doi-thuong': 'Cách tân nhẹ nhàng đầy tinh tế: tà áo ngũ thân kết hợp quần lụa trắng và sneaker trắng bước đi êm ái giữa Đời Thường Phố Cổ. Đem vẻ đẹp thanh tao của cổ phục hòa mình tự nhiên vào nhịp sống đương đại.',
  },
};

export function assembleOutfitSummary(
  outfit: Outfit,
  scene?: Scene,
  preset?: Preset,
  itemLookup: (id: string) => Item | undefined = getItem
): string {
  // 1. If outfit matches a named Preset, check dedicated preset-scene matrix
  if (preset) {
    if (scene && PRESET_SCENE_NARRATIVES[preset.id]?.[scene.id]) {
      return PRESET_SCENE_NARRATIVES[preset.id][scene.id];
    }
    const presetStory = getPresetStory(preset.id);
    if (presetStory) {
      let text = presetStory.summary;
      if (scene) {
        text += ` Phối cùng không gian ${scene.name_vi} tạo nên tổng thể trang nhã.`;
      }
      return text;
    }
  }

  // 2. Otherwise assemble dynamically from cultural fragments
  const level = remixLevel(outfit, itemLookup);
  const levelStory = getRemixLevelStory(level);
  const fragments: string[] = [];

  // Starting fragment: Remix level theme
  if (levelStory) {
    fragments.push(`${levelStory.title}: ${levelStory.summary}`);
  }

  // Identify worn items
  const items: Item[] = outfit.itemIds
    .map((id) => itemLookup(id))
    .filter((i): i is Item => Boolean(i));

  const top = items.find((i) => i.slot === 'top');
  const bottom = items.find((i) => i.slot === 'bottom');
  const shoes = items.find((i) => i.slot === 'shoes');
  const accessories = items.filter((i) => i.slot === 'neck' || i.slot === 'head');

  const garmentDesc: string[] = [];
  if (top) {
    const topStory = getItemStory(top.id, itemLookup);
    garmentDesc.push(`Thân trên trang trọng với ${top.name_vi} (${topStory?.period || 'cổ truyền'})`);
  }
  if (bottom) {
    garmentDesc.push(`kết hợp hài hòa cùng ${bottom.name_vi}`);
  }
  if (shoes) {
    garmentDesc.push(`đi cùng ${shoes.name_vi}`);
  }

  if (garmentDesc.length > 0) {
    fragments.push(garmentDesc.join(', ') + '.');
  }

  if (accessories.length > 0) {
    const accNames = accessories.map((a) => a.name_vi).join(' và ');
    fragments.push(`Điểm xuyết thêm phụ kiện ${accNames} tinh tế.`);
  }

  // Contextual scene sentence
  if (scene) {
    fragments.push(`Tổng thể hòa nhịp cùng không khí ${scene.name_vi}.`);
  }

  // Evaluation warnings / suggestions
  const evalResult = evaluate(outfit, undefined, itemLookup);
  if (evalResult.warn.length > 0) {
    const warnTexts = evalResult.warn.map((w) => w.message_vi).join(' ');
    fragments.push(`* Lưu ý văn hóa: ${warnTexts}`);
  } else if (evalResult.suggest.length > 0) {
    const suggestTexts = evalResult.suggest.map((s) => s.message_vi).join(' ');
    fragments.push(`* Gợi ý: ${suggestTexts}`);
  }

  return fragments.join(' ');
}
