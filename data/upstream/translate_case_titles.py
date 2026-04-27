#!/usr/bin/env python3
"""Translate specified English case titles in zh-CN and zh-TW READMEs.

It updates:
1) Body headings: ### Case N: [Title](url) ...
2) Menu items: [Case N: Title (by @handle)](#anchor)

Only titles in the mapping are translated. Existing Chinese titles stay unchanged.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).parent

CN_MAP = {
    # Portrait & Photography
    "Convenience Store Neon Portrait": "便利店霓虹灯人像",
    "Cinematic Minimal Portrait": "电影感极简人像",
    "Japanese Onsen Ryokan Portrait": "日式温泉旅馆人像",
    "35mm Flash Editorial Portrait": "35mm 闪光灯编辑人像",
    "Mirror Selfie Bedroom Portrait": "卧室镜前自拍人像",
    "Soft Airy 35mm Portrait": "柔和通透 35mm 人像",
    "Luxury Glam Beauty Portrait": "奢华魅力美妆人像",
    "9:16 Cosplayer Portrait Screenshot": "9:16 Cosplay 人像截图",
    "Urban Turn-Back Street Portrait": "城市回眸街头人像",
    "Sam Altman Skatepark Snapshot": "Sam Altman 滑板公园随拍",
    "Korean Idol 3x3 Grid Portrait": "韩国偶像 3x3 九宫格人像",
    "CCD Camera Flash Korean Idol": "CCD 相机闪光灯韩国偶像",
    "Korean Idol 3x3 Collage Portrait": "韩国偶像 3x3 拼贴人像",
    "Soft Black Mist Editorial Portrait": "柔和黑雾编辑人像",
    "Fujifilm Strawberry School Portrait": "富士胶片草莓校园人像",
    "Soft Black Mist Idol Portrait": "柔和黑雾偶像人像",
    "Fujifilm Couple Portrait": "富士胶片情侣人像",
    "AI Self-Perception Portrait": "AI 自我感知人像",

    # Poster & Illustration
    "Boston Spring 2026 City Poster": "2026 年波士顿春季城市海报",
    "Vintage Amalfi Travel Poster": "复古阿马尔菲旅行海报",
    "Chengdu Food Map Illustration": "成都美食地图插画",
    "Chinese Minimalist S-Shaped Poster": "中式极简 S 形海报",
    "2026 Spring Guangzhou City Poster": "2026 年春季广州城市海报",
    "Doodle Sketch AI Builder": "涂鸦草图 AI 构建者",
    "Futuristic Mandala Illustration": "未来感曼陀罗插画",
    "Super Famicom Poster Style": "超级任天堂海报风格",
    "Browser Game Ad Creative Poster": "浏览器游戏广告创意海报",
    "Surreal Koi Nebula Illustration": "超现实鲤鱼星云插画",
    "Ink-Curve Guangzhou Aesthetics Poster": "墨曲广州美学海报",
    "Guangdong Super League Invitation Poster": "广东超级联赛邀请海报",
    "Spring 2026 Guangzhou Promo Poster": "2026 年春季广州宣传海报",
    "Epic Silhouette World Poster": "史诗剪影世界海报",
    "Spring Guangzhou City Poster": "春季广州城市海报",
    "Qiongqi Eastern Aesthetics Poster": "穷奇东方美学海报",
    "Guangzhou Paper-Cut City Poster": "广州剪纸城市海报",
    "Extreme Perspective Typography Bridge": "极端透视排版桥梁",
    "Dreamy Watercolor Editorial Illustration": "梦幻水彩编辑插画",
    "Science Encyclopedia Vertical Poster": "科学百科竖版海报",
    "Journey to the West Chinese Comic": "西游记中国漫画",
    "Character Relationship Map Poster": "人物关系图海报",
    "New Chinese Ink Landscape Poster": "新中式水墨山水海报",
    "AI Builder Doodle Sketch": "AI 构建者涂鸦草图",
    "Character Visual Vertical Poster": "角色视觉竖版海报",
    "Science Encyclopedia Infographic": "科学百科信息图",
    "Fictional Anime Movie Poster": "虚构动漫电影海报",
    "Product Ad Redesign": "产品广告重设计",
    "Dark-Fantasy Guangzhou City Poster": "暗黑奇幻广州城市海报",
    "Science Fiction Movie Poster": "科幻电影海报",
    "Refreshing Summer Udon Ad": "清爽夏日乌冬面广告",
    "Handwritten Medical Prescription Sheet": "手写医疗处方单",
    "Silicon Valley 2026 Promo Poster": "2026 年硅谷推广海报",
    "Japanese Supermarket Sale Flyer": "日式超市促销传单",
    "Dark Epic Concept Poster": "暗黑史诗概念海报",
    "Pilates Studio Ad Poster": "普拉提工作室广告海报",
    "6-Block Fashion Campaign Prompt Formula": "6 格时尚大片提示词公式",
    "Sony A7 Exploded View Breakdown Prompt": "索尼 A7 爆炸图分解提示词",
    "1900 Istiklal Street Panorama Prompt": "1900 年伊斯蒂克拉尔大街全景提示词",
    "Theme Science Encyclopedia Card": "主题科学百科卡片",
    "Chili Pork Cooking Flowchart": "辣椒猪肉烹饪流程图",
    "Cinematic Infographic Concept Poster": "电影感信息图概念海报",

    # UI & Social Media
    "One-Prompt UI Design Generation": "单提示词 UI 设计生成",
    "Amateur iPhone Keynote Snapshot": "业余 iPhone 发布会随拍",
    "Handwritten Notebook Photo": "手写笔记本照片",
    "Song Dynasty Social Media Feed": "宋朝社交媒体信息流",
    "Multi-Platform Content Screenshots": "多平台内容截图",
    "Liu Yifei Douyin Livestream Screenshot": "刘亦菲抖音直播截图",
    "King Taejo Yi Seong-gye's X Page": "朝鲜太祖李成桂的 X 主页",
    "Style-to-UI Design System": "风格转 UI 设计系统",
    "Momotaro Explainer Slide": "桃太郎说明幻灯片",
    "Museum-Style Hanfu Breakdown Infographic": "博物馆风格汉服解析信息图",
    "Glassy UI Design System": "玻璃质感 UI 设计系统",
    "Japanese RPG Status Screen": "日式 RPG 状态界面",
    "Xuanwu Gate Social Feed": "玄武门社交信息流",
    "City Travel Guide Infographic": "城市旅游指南信息图",
    "3D X Profile Mockup": "3D X 主页模型",
    "Empress Dowager Cixi X Page": "慈禧太后的 X 主页",
    "Palm Reading Diagnosis Report": "手相诊断报告",
    "Calligraphy Copybook Sheet": "书法字帖页",
    "Don Quijote Promo Pop Poster": "唐吉诃德促销流行海报",
    "Japanese Gacha Game Screen": "日式扭蛋游戏界面",
    "Elon Musk Douyin Livestream Screenshot": "埃隆·马斯克抖音直播截图",
    "Trump and Kim Livestream PK Screenshot": "特朗普与金正恩直播 PK 截图",
    "Japanese AI Game Dev Overview Slide Prompt": "日本 AI 游戏开发概览幻灯片",
    "Cyberpunk Neon UI Design System": "赛博朋克霓虹 UI 设计系统",

    # Comparison & Community
    "Wooden Bookshelf Prompt Test": "木质书架提示词测试",
    "GPT-Image-2 Detail Showcase": "GPT-Image-2 细节展示",
    "A/B Test Signed Output": "A/B 测试签名输出",
    "Silhouette Universe Narrative Poster": "剪影宇宙叙事海报",
    "Lion Camel Ridge Dark Myth Scene": "狮驼岭暗黑神话场景",
    "Counter-Strike x Terraria Screenshot Mashup": "CS x Terraria 截图混搭",
    "Pre-war Japan Lab Minecraft Screenshot": "战前日本实验室 Minecraft 截图",
    "Forged Masterpiece Prompt Test": "伪造杰作提示词测试",
    "Multi-Concept Battle Poster Set": "多概念战斗海报组",
    "Rust In-Game Screenshot": "Rust 游戏内截图",
    "Sam Altman Bear Selfie": "Sam Altman 与熊自拍",
    "Among Us Realistic Screenshot": "Among Us 写实截图",
    "Retro Programming Museum Cartoon": "复古编程博物馆卡通",
    "14th-Dimension Projection Scene": "第十四维投影场景",
    "Sam Altman Baseball Broadcast": "Sam Altman 棒球转播",
    "Anime Snapshot Conversion": "动漫快照转换",
    "Persona5 Character Reference Card": "Persona5 角色参考卡",
    "Gal Game Character Introduction Page": "美少女游戏角色介绍页",
    "Official Character Sheet (JP)": "官方角色设定表（日版）",
    "Mecha Girl Sea-City Key Visual": "机甲少女海城关键视觉",
    "Saint Seiya Gold Saints Card Grid": "圣斗士星矢黄金圣斗士卡片网格",
    "Chaos Notes Hidden Face Character Art": "混沌笔记隐藏脸角色艺术",
    "Based on the video content and this current frame, use GPT to generate a YouT...": "基于视频内容生成 YouTube 标题",
    "Edit this image so that total amount changes to 244.5 baht. You can change th...": "修改图片金额为 244.5 泰铢",
}

TW_MAP = {
    # Portrait & Photography
    "Convenience Store Neon Portrait": "便利店霓虹燈人像",
    "Cinematic Minimal Portrait": "電影感極簡人像",
    "Japanese Onsen Ryokan Portrait": "日式溫泉旅館人像",
    "35mm Flash Editorial Portrait": "35mm 閃光燈編輯人像",
    "Mirror Selfie Bedroom Portrait": "臥室鏡前自拍人像",
    "Soft Airy 35mm Portrait": "柔和通透 35mm 人像",
    "Luxury Glam Beauty Portrait": "奢華魅力美妝人像",
    "9:16 Cosplayer Portrait Screenshot": "9:16 Cosplay 人像截圖",
    "Urban Turn-Back Street Portrait": "城市回眸街頭人像",
    "Sam Altman Skatepark Snapshot": "Sam Altman 滑板公園隨拍",
    "Korean Idol 3x3 Grid Portrait": "韓國偶像 3x3 九宮格人像",
    "CCD Camera Flash Korean Idol": "CCD 相機閃光燈韓國偶像",
    "Korean Idol 3x3 Collage Portrait": "韓國偶像 3x3 拼貼人像",
    "Soft Black Mist Editorial Portrait": "柔和黑霧編輯人像",
    "Fujifilm Strawberry School Portrait": "富士膠片草莓校園人像",
    "Soft Black Mist Idol Portrait": "柔和黑霧偶像人像",
    "Fujifilm Couple Portrait": "富士膠片情侶人像",
    "AI Self-Perception Portrait": "AI 自我感知人像",

    # Poster & Illustration
    "Boston Spring 2026 City Poster": "2026 年波士頓春季城市海報",
    "Vintage Amalfi Travel Poster": "復古阿馬爾菲旅行海報",
    "Chengdu Food Map Illustration": "成都美食地圖插畫",
    "Chinese Minimalist S-Shaped Poster": "中式極簡 S 形海報",
    "2026 Spring Guangzhou City Poster": "2026 年春季廣州城市海報",
    "Doodle Sketch AI Builder": "塗鴉草圖 AI 構建者",
    "Futuristic Mandala Illustration": "未來感曼陀羅插畫",
    "Super Famicom Poster Style": "超級任天堂海報風格",
    "Browser Game Ad Creative Poster": "瀏覽器遊戲廣告創意海報",
    "Surreal Koi Nebula Illustration": "超現實鯉魚星雲插畫",
    "Ink-Curve Guangzhou Aesthetics Poster": "墨曲廣州美學海報",
    "Guangdong Super League Invitation Poster": "廣東超級聯賽邀請海報",
    "Spring 2026 Guangzhou Promo Poster": "2026 年春季廣州宣傳海報",
    "Epic Silhouette World Poster": "史詩剪影世界海報",
    "Spring Guangzhou City Poster": "春季廣州城市海報",
    "Qiongqi Eastern Aesthetics Poster": "窮奇東方美學海報",
    "Guangzhou Paper-Cut City Poster": "廣州剪紙城市海報",
    "Extreme Perspective Typography Bridge": "極端透視排版橋梁",
    "Dreamy Watercolor Editorial Illustration": "夢幻水彩編輯插畫",
    "Science Encyclopedia Vertical Poster": "科學百科豎版海報",
    "Journey to the West Chinese Comic": "西遊記中國漫畫",
    "Character Relationship Map Poster": "人物關係圖海報",
    "New Chinese Ink Landscape Poster": "新中式水墨山水海報",
    "AI Builder Doodle Sketch": "AI 構建者塗鴉草圖",
    "Character Visual Vertical Poster": "角色視覺豎版海報",
    "Science Encyclopedia Infographic": "科學百科信息圖",
    "Fictional Anime Movie Poster": "虛構動漫電影海報",
    "Product Ad Redesign": "產品廣告重設計",
    "Dark-Fantasy Guangzhou City Poster": "暗黑奇幻廣州城市海報",
    "Science Fiction Movie Poster": "科幻電影海報",
    "Refreshing Summer Udon Ad": "清爽夏日烏冬麵廣告",
    "Handwritten Medical Prescription Sheet": "手寫醫療處方單",
    "Silicon Valley 2026 Promo Poster": "2026 年矽谷推廣海報",
    "Japanese Supermarket Sale Flyer": "日式超市促銷傳單",
    "Dark Epic Concept Poster": "暗黑史詩概念海報",
    "Pilates Studio Ad Poster": "普拉提工作室廣告海報",
    "6-Block Fashion Campaign Prompt Formula": "6 格時尚大片提示詞公式",
    "Sony A7 Exploded View Breakdown Prompt": "索尼 A7 爆炸圖分解提示詞",
    "1900 Istiklal Street Panorama Prompt": "1900 年伊斯蒂克拉爾大街全景提示詞",
    "Theme Science Encyclopedia Card": "主題科學百科卡片",
    "Chili Pork Cooking Flowchart": "辣椒豬肉烹飪流程圖",
    "Cinematic Infographic Concept Poster": "電影感資訊圖概念海報",

    # UI & Social Media
    "One-Prompt UI Design Generation": "單提示詞 UI 設計生成",
    "Amateur iPhone Keynote Snapshot": "業餘 iPhone 發布會隨拍",
    "Handwritten Notebook Photo": "手寫筆記本照片",
    "Song Dynasty Social Media Feed": "宋朝社交媒體信息流",
    "Multi-Platform Content Screenshots": "多平台內容截圖",
    "Liu Yifei Douyin Livestream Screenshot": "劉亦菲抖音直播截圖",
    "King Taejo Yi Seong-gye's X Page": "朝鮮太祖李成桂的 X 主頁",
    "Style-to-UI Design System": "風格轉 UI 設計系統",
    "Momotaro Explainer Slide": "桃太郎說明幻燈片",
    "Museum-Style Hanfu Breakdown Infographic": "博物館風格漢服解析信息圖",
    "Glassy UI Design System": "玻璃質感 UI 設計系統",
    "Japanese RPG Status Screen": "日式 RPG 狀態界面",
    "Xuanwu Gate Social Feed": "玄武門社交信息流",
    "City Travel Guide Infographic": "城市旅遊指南信息圖",
    "3D X Profile Mockup": "3D X 主頁模型",
    "Empress Dowager Cixi X Page": "慈禧太後的 X 主頁",
    "Palm Reading Diagnosis Report": "手相診斷報告",
    "Calligraphy Copybook Sheet": "書法字帖頁",
    "Don Quijote Promo Pop Poster": "唐吉訶德促銷流行海報",
    "Japanese Gacha Game Screen": "日式扭蛋遊戲界面",
    "Elon Musk Douyin Livestream Screenshot": "埃隆·馬斯克抖音直播截圖",
    "Trump and Kim Livestream PK Screenshot": "特朗普與金正恩直播 PK 截圖",
    "Japanese AI Game Dev Overview Slide Prompt": "日本 AI 遊戲開發概覽幻燈片",
    "Cyberpunk Neon UI Design System": "賽博朋克霓虹 UI 設計系統",

    # Comparison & Community
    "Wooden Bookshelf Prompt Test": "木質書架提示詞測試",
    "GPT-Image-2 Detail Showcase": "GPT-Image-2 細節展示",
    "A/B Test Signed Output": "A/B 測試簽名輸出",
    "Silhouette Universe Narrative Poster": "剪影宇宙敘事海報",
    "Lion Camel Ridge Dark Myth Scene": "獅駝嶺暗黑神話場景",
    "Counter-Strike x Terraria Screenshot Mashup": "CS x Terraria 截圖混搭",
    "Pre-war Japan Lab Minecraft Screenshot": "戰前日本實驗室 Minecraft 截圖",
    "Forged Masterpiece Prompt Test": "偽造傑作提示詞測試",
    "Multi-Concept Battle Poster Set": "多概念戰鬥海報組",
    "Rust In-Game Screenshot": "Rust 遊戲內截圖",
    "Sam Altman Bear Selfie": "Sam Altman 與熊自拍",
    "Among Us Realistic Screenshot": "Among Us 寫實截圖",
    "Retro Programming Museum Cartoon": "復古編程博物館卡通",
    "14th-Dimension Projection Scene": "第十四維投影場景",
    "Sam Altman Baseball Broadcast": "Sam Altman 棒球轉播",
    "Anime Snapshot Conversion": "動漫快照轉換",
    "Persona5 Character Reference Card": "Persona5 角色參考卡",
    "Gal Game Character Introduction Page": "美少女遊戲角色介紹頁",
    "Official Character Sheet (JP)": "官方角色設定表（日版）",
    "Mecha Girl Sea-City Key Visual": "機甲少女海城關鍵視覺",
    "Saint Seiya Gold Saints Card Grid": "聖鬥士星矢黃金聖鬥士卡片網格",
    "Chaos Notes Hidden Face Character Art": "混沌筆記隱藏臉角色藝術",
    "Based on the video content and this current frame, use GPT to generate a YouT...": "基於視頻內容生成 YouTube 標題",
    "Edit this image so that total amount changes to 244.5 baht. You can change th...": "修改圖片金額為 244.5 泰銖",
}


def get_map(lang: str) -> dict[str, str]:
    if lang == "zh-CN":
        return CN_MAP
    if lang == "zh-TW":
        return TW_MAP
    raise ValueError(f"Unsupported language: {lang}")


def slugify_anchor_text(text: str) -> str:
    """Approximate GitHub anchor slug generation for README headings."""
    s = text.lower()
    s = s.replace(" ", "-")
    s = re.sub(r"[^\w\-一-鿿]", "", s, flags=re.UNICODE)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")


def translate_headings(content: str, mapping: dict[str, str]) -> tuple[str, int]:
    count = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal count
        prefix, title, suffix = m.group(1), m.group(2), m.group(3)
        if title in mapping:
            count += 1
            return f"{prefix}{mapping[title]}{suffix}"
        return m.group(0)

    pattern = re.compile(r"^(### Case \d+: \[)([^\]]+)(\]\([^\)]+\).*)$", re.MULTILINE)
    return pattern.sub(repl, content), count


def update_menu(content: str, mapping: dict[str, str]) -> tuple[str, int, int]:
    translated = 0
    anchors_updated = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal translated, anchors_updated
        case_no = m.group(1)
        title = m.group(2).strip()
        handle = m.group(3)

        new_title = mapping.get(title, title)
        if new_title != title:
            translated += 1

        anchor_text = f"Case {case_no}: {new_title} (by @{handle})"
        new_anchor = slugify_anchor_text(anchor_text)

        if new_anchor != m.group(4):
            anchors_updated += 1

        return f"[Case {case_no}: {new_title} (by @{handle})](#{new_anchor})"

    pattern = re.compile(r"\[Case (\d+): ([^\]]+?) \(by @([^\)]+)\)\]\(#([^\)]+)\)")
    return pattern.sub(repl, content), translated, anchors_updated


def process_file(path: Path, lang: str) -> None:
    mapping = get_map(lang)
    content = path.read_text(encoding="utf-8")

    content, heading_changes = translate_headings(content, mapping)
    content, menu_title_changes, anchor_changes = update_menu(content, mapping)

    path.write_text(content, encoding="utf-8")

    print(f"{path.name} ({lang})")
    print(f"  heading title replacements: {heading_changes}")
    print(f"  menu title replacements:    {menu_title_changes}")
    print(f"  menu anchor updates:        {anchor_changes}")


if __name__ == "__main__":
    process_file(ROOT / "README_zh-CN.md", "zh-CN")
    process_file(ROOT / "README_zh-TW.md", "zh-TW")
