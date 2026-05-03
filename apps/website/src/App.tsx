import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import type { Profile } from "./supabase";
import { ChevronLeft, Share2, Eye, X, Plus, Edit3, Check, AlertCircle } from "lucide-react";
import imgLogo from "./assets/170805.jpg";
import imgTitle from "./assets/117_20260501195729.png";
import imgSearch from "./assets/118_20260501193319.png";
import imgUser from "./assets/119_20260501193952.png";
import imgStar from "./assets/120_20260501194440.png";
import imgSettings from "./assets/121_20260501195446.png";

const LogoIcon = ({ className = "w-8 h-8" }) => (
  <img src={imgLogo} className={`${className} object-cover rounded`} alt="Logo" />
);
const CustomSearchIcon = ({
  className = "w-6 h-6",
  active,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgSearch}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-blue-500" : ""}`}
    alt="Search"
  />
);
const CustomUserIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgUser}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-blue-500" : ""}`}
    alt="User"
  />
);
const CustomStarIcon = ({
  className = "w-6 h-6",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgStar}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-yellow-400" : ""}`}
    alt="Star"
  />
);
const CustomSettingsIcon = ({
  className = "w-6 h-6",
  active,
}: {
  className?: string;
  active?: boolean;
}) => (
  <img
    src={imgSettings}
    className={`${className} object-cover rounded-full ${active ? "ring-2 ring-gray-400" : ""}`}
    alt="Settings"
  />
);

const MOCK_WRITERS = [
  {
    id: "w1",
    name: "山田 太郎",
    role: "編集長",
    bio: "「学ぶって楽しい！」を全力で伝えます。科学とテクノロジーが好きです。",
  },
  {
    id: "w2",
    name: "佐藤 花子",
    role: "ライター",
    bio: "日常に潜む理科の面白い話を探して発信しています。",
  },
  {
    id: "w3",
    name: "鈴木 一郎",
    role: "ライター",
    bio: "歴史の教科書には載っていない裏話をわかりやすく解説中。",
  },
];
const MOCK_TAGS = ["理科", "歴史", "数学", "国語", "英語", "プログラミング", "雑学"];
const INITIAL_ARTICLES = [
  {
    id: "a1",
    title: "宇宙の果てはどうなっている？",
    thumbnail: "bg-indigo-900",
    writerId: "w2",
    views: 1250,
    likes: 342,
    tags: ["理科", "雑学"],
    isRecommended: true,
    isPopular: true,
    status: "published",
    summary: "夜空を見上げると広がる宇宙。その「果て」はいったいどうなっているのでしょうか？",
    content:
      "宇宙は今この瞬間も膨張を続けています。風船が膨らむように、星と星の間の空間が広がっているのです。",
  },
  {
    id: "a2",
    title: "江戸時代のファストフード事情",
    thumbnail: "bg-amber-600",
    writerId: "w3",
    views: 890,
    likes: 125,
    tags: ["歴史", "雑学"],
    isRecommended: false,
    isPopular: true,
    status: "published",
    summary: "現代の私たちがよく食べるあのご飯、実は江戸時代の「ファストフード」だったんです。",
    content:
      "江戸時代、手軽に食べられる外食産業が発達しました。代表的なものが「寿司」「天ぷら」「蕎麦」です。",
  },
  {
    id: "a3",
    title: "数学のタブー「0で割る」とどうなる？",
    thumbnail: "bg-teal-600",
    writerId: "w1",
    views: 530,
    likes: 88,
    tags: ["数学"],
    isRecommended: true,
    isPopular: false,
    status: "published",
    summary: "学校で「0で割ってはいけない」と習ったはず。でも、もし割ってしまったら？",
    content: "割り算は掛け算の逆です。「1 ÷ 0 = ?」は「? × 0 = 1」となるため、答えが存在しません。",
  },
  {
    id: "a4",
    title: "【申請中】面白い錯覚の世界",
    thumbnail: "bg-purple-500",
    writerId: "w2",
    views: 0,
    likes: 0,
    tags: ["理科"],
    isRecommended: false,
    isPopular: false,
    status: "pending",
    summary: "目が騙される不思議な図形について。",
    content: "錯視のメカニズムを解説します。",
  },
];

const VIEW_TO_PATH: Record<string, string> = {
  home: "/",
  search: "/search",
  settings: "/settings",
  writers: "/writers",
  favorites: "/favorites",
  about: "/about",
  writerDash: "/writer-dash",
  editorDash: "/editor-dash",
  login: "/login",
  register: "/register",
};

function parseLocation(pathname: string): { currentView: string; viewParam: string | null } {
  if (pathname === "/" || pathname === "") return { currentView: "home", viewParam: null };
  if (pathname === "/search") return { currentView: "search", viewParam: null };
  if (pathname === "/settings") return { currentView: "settings", viewParam: null };
  if (pathname === "/favorites") return { currentView: "favorites", viewParam: null };
  if (pathname === "/about") return { currentView: "about", viewParam: null };
  if (pathname === "/writer-dash") return { currentView: "writerDash", viewParam: null };
  if (pathname === "/editor-dash") return { currentView: "editorDash", viewParam: null };
  if (pathname === "/login") return { currentView: "login", viewParam: null };
  if (pathname === "/register") return { currentView: "register", viewParam: null };
  if (pathname === "/writers") return { currentView: "writers", viewParam: null };
  const writersMatch = pathname.match(/^\/writers\/(.+)$/);
  if (writersMatch) return { currentView: "profile", viewParam: writersMatch[1] };
  const articleMatch = pathname.match(/^\/articles\/(.+)$/);
  if (articleMatch) return { currentView: "article", viewParam: articleMatch[1] };
  return { currentView: "notFound", viewParam: null };
}

export default function App() {
  const location = useLocation();
  const nav = useNavigate();
  const { currentView, viewParam } = useMemo(
    () => parseLocation(location.pathname),
    [location.pathname],
  );

  const [userRole, setUserRole] = useState<"guest" | "viewer" | "writer" | "editor">("guest");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile(data);
              setUserRole(data.role);
            }
          });
      }
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile(data);
              setUserRole(data.role);
            }
          });
      } else {
        setProfile(null);
        setUserRole("guest");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>
    );
  const currentUserId = userRole === "editor" ? "w1" : userRole === "writer" ? "w2" : "user1";
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [fontSize, setFontSize] = useState("medium");
  const [favorites, setFavorites] = useState(["a1"]);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const navigate = (view: string, param: string | null = null) => {
    if (view === "profile" && param) nav(`/writers/${param}`);
    else if (view === "article" && param) nav(`/articles/${param}`);
    else nav(VIEW_TO_PATH[view] ?? "/");
    window.scrollTo(0, 0);
  };

  const getFontSizeClass = () =>
    ({ small: "text-sm", medium: "text-base", large: "text-lg" })[
      fontSize as "small" | "medium" | "large"
    ] ?? "text-base";

  const toggleFavorite = (articleId: string) => {
    if (userRole === "guest") {
      showToast("お気に入り機能はログインが必要です");
      return;
    }
    if (favorites.includes(articleId)) {
      setFavorites(favorites.filter((id) => id !== articleId));
      showToast("お気に入りから削除しました");
    } else {
      setFavorites([...favorites, articleId]);
      showToast("お気に入りに登録しました");
    }
  };

  // --- Header ---
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("home")}>
          <LogoIcon />
          <img
            src={imgTitle}
            className="h-8 object-contain hidden sm:inline-block"
            alt="SHARE Quest"
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("search")} className="p-1 rounded-full hover:bg-gray-100">
            <CustomSearchIcon active={currentView === "search"} />
          </button>
          <button
            onClick={() => navigate("writers")}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <CustomUserIcon active={currentView === "writers" || currentView === "profile"} />
          </button>
          <button
            onClick={() => navigate("favorites")}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <CustomStarIcon active={currentView === "favorites"} />
          </button>
          <button
            onClick={() => navigate("settings")}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <CustomSettingsIcon
              active={
                currentView === "settings" ||
                currentView === "writerDash" ||
                currentView === "editorDash"
              }
            />
          </button>
        </div>
      </div>
    </header>
  );

  // --- ArticleCard ---
  const ArticleCard = ({
    article,
    layout = "horizontal",
  }: {
    article: any;
    layout?: "horizontal" | "vertical";
  }) => {
    const writer = MOCK_WRITERS.find((w) => w.id === article.writerId);
    const isFav = favorites.includes(article.id);
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${layout === "horizontal" ? "flex h-28" : "flex flex-col"}`}
        onClick={() => navigate("article", article.id)}
      >
        <div
          className={`${article.thumbnail} ${layout === "horizontal" ? "w-1/3 min-w-[110px]" : "w-full h-32"} flex items-center justify-center`}
        >
          <LogoIcon className="w-10 h-10 opacity-30" />
        </div>
        <div
          className={`p-3 flex flex-col justify-between ${layout === "horizontal" ? "w-2/3" : "w-full"}`}
        >
          <h3 className="font-bold text-gray-800 line-clamp-2 text-sm md:text-base leading-snug">
            {article.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[70%]">
              <CustomUserIcon className="w-4 h-4" /> {writer?.name}
            </span>
            <CustomStarIcon className="w-5 h-5" active={isFav} />
          </div>
        </div>
      </div>
    );
  };

  // --- HomeView ---
  const HomeView = () => {
    const published = articles.filter((a) => a.status === "published");
    return (
      <div className="p-4 space-y-8 animate-in fade-in duration-300">
        <div className="text-center py-5 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden">
          <LogoIcon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          <p className="text-blue-600 font-bold tracking-wide">
            ー 学びの『楽しい！』をつなげる ー
          </p>
          <button
            onClick={() => navigate("about")}
            className="text-xs text-blue-500 underline mt-2 hover:text-blue-700"
          >
            SHARE Questとは？
          </button>
        </div>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CustomStarIcon className="w-6 h-6" active={true} /> おすすめの記事
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {published
              .filter((a) => a.isRecommended)
              .map((article) => (
                <div key={article.id} className="min-w-[240px] snap-start">
                  <ArticleCard article={article} layout="vertical" />
                </div>
              ))}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-red-500 font-bold text-xl">🔥</span> 人気の記事
          </h2>
          <div className="space-y-3">
            {published
              .filter((a) => a.isPopular)
              .map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">記事一覧</h2>
          <div className="space-y-3">
            {published.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>
    );
  };

  // --- ArticleView ---
  const ArticleView = () => {
    const article = articles.find((a) => a.id === viewParam);
    if (!article) return <div className="p-10 text-center">記事が見つかりません</div>;
    const writer = MOCK_WRITERS.find((w) => w.id === article.writerId);
    const isFav = favorites.includes(article.id);
    return (
      <div className="animate-in slide-in-from-right-8 duration-300 bg-white min-h-screen">
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-2 py-2 flex items-center">
          <button
            onClick={() => navigate("home")}
            className="p-2 rounded-full hover:bg-gray-100 flex items-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-bold text-gray-600">戻る</span>
          </button>
        </div>
        <div
          className={`${article.thumbnail} w-full h-48 flex items-center justify-center relative`}
        >
          <LogoIcon className="w-20 h-20 opacity-20" />
          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            画像モック
          </span>
        </div>
        <div className="p-4 space-y-5">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{article.title}</h1>
          <div className="bg-blue-50 p-4 rounded-xl text-gray-700 border border-blue-100 font-medium">
            {article.summary}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <Eye className="w-4 h-4" /> {article.views}
              </span>
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <CustomStarIcon className="w-4 h-4" active={isFav} /> {article.likes}
              </span>
            </div>
            <button
              onClick={() => toggleFavorite(article.id)}
              className={`p-2 rounded-full border shadow-sm transition-all ${isFav ? "bg-yellow-50 border-yellow-300 scale-110" : "bg-white border-gray-200"}`}
            >
              <CustomStarIcon className="w-6 h-6" active={isFav} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={() => navigate("profile", writer?.id)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full border border-gray-200">
                <CustomUserIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-0.5">この記事を書いた人</p>
                <p className="font-bold text-gray-800">{writer?.name}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
              プロフィールへ
            </span>
          </div>
          <div
            className={`py-4 text-gray-800 whitespace-pre-wrap leading-loose ${getFontSizeClass()}`}
          >
            {article.content}
          </div>
          <div className="border-t pt-8 pb-4 space-y-4">
            <p className="font-bold text-gray-800 text-center">この記事を共有</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => showToast("Xにシェアしました")}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:opacity-80 shadow-md"
              >
                <span className="font-bold text-2xl">X</span>
              </button>
              <button
                onClick={() => showToast("LINEにシェアしました")}
                className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center hover:opacity-80 shadow-md"
              >
                <span className="font-bold text-sm">LINE</span>
              </button>
              <button
                onClick={() => showToast("リンクをコピーしました")}
                className="w-14 h-14 bg-white border-2 border-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">※コメント機能は利用できません</p>
        </div>
      </div>
    );
  };

  // --- SearchView ---
  const SearchView = () => (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      <div className="relative">
        <input
          type="text"
          placeholder="キーワードで検索"
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
        />
        <div className="absolute left-3 top-3.5">
          <CustomSearchIcon className="w-7 h-7" />
        </div>
      </div>
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">タグでしぼる</h3>
        <div className="flex flex-wrap gap-2">
          {MOCK_TAGS.map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">ライターでしぼる</h3>
        <div className="grid grid-cols-2 gap-3">
          {MOCK_WRITERS.map((writer) => (
            <div
              key={writer.id}
              className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <CustomUserIcon className="w-6 h-6" />
              <span className="text-sm font-bold text-gray-700 truncate">{writer.name}</span>
            </div>
          ))}
        </div>
      </section>
      <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all text-lg">
        検索する
      </button>
    </div>
  );

  // --- WritersView ---
  const WritersView = () => {
    const editors = MOCK_WRITERS.filter((w) => w.role === "編集長");
    const writers = MOCK_WRITERS.filter((w) => w.role === "ライター");
    const WriterRow = ({ writer }: { writer: any }) => (
      <div
        className="flex items-center justify-between p-4 bg-white border-b last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors"
        onClick={() => navigate("profile", writer.id)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-2 rounded-full border border-gray-200">
            <CustomUserIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{writer.name}</p>
            <p className="text-xs font-bold text-blue-500">{writer.role}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-500 flex items-center">
          記事一覧 <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
        </span>
      </div>
    );
    return (
      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b-2 border-blue-500 pb-2 inline-flex">
          <CustomUserIcon className="w-6 h-6" active={true} /> ライター・編集長 一覧
        </h2>
        <section>
          <h3 className="text-sm font-bold text-gray-500 mb-2 pl-2">編集長</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {editors.map((w) => (
              <WriterRow key={w.id} writer={w} />
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-bold text-gray-500 mb-2 pl-2 mt-6">
            ライター (あいうえお順)
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {writers.map((w) => (
              <WriterRow key={w.id} writer={w} />
            ))}
          </div>
        </section>
      </div>
    );
  };

  // --- ProfileView ---
  const ProfileView = () => {
    const writer = MOCK_WRITERS.find((w) => w.id === viewParam);
    if (!writer) return <div>見つかりません</div>;
    const writerArticles = articles.filter(
      (a) => a.writerId === writer.id && a.status === "published",
    );
    return (
      <div className="animate-in slide-in-from-right-8 duration-300">
        <div className="bg-gradient-to-b from-blue-500 to-blue-700 pt-12 pb-8 px-4 text-center text-white relative">
          <button
            onClick={() => navigate("writers")}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/30 flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5 text-white" />{" "}
            <span className="text-xs font-bold">戻る</span>
          </button>
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-white">
            <CustomUserIcon className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-bold mb-1">{writer.name}</h2>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
            {writer.role}
          </span>
        </div>
        <div className="p-4 space-y-6 -mt-4 relative z-10">
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 text-gray-700 text-sm font-medium leading-relaxed">
            {writer.bio}
          </div>
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded-lg">
                <LogoIcon className="w-5 h-5" />
              </span>{" "}
              この人の記事
            </h3>
            <div className="space-y-3">
              {writerArticles.length > 0 ? (
                writerArticles.map((article) => <ArticleCard key={article.id} article={article} />)
              ) : (
                <p className="text-gray-500 text-sm text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  まだ記事がありません
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

  // --- FavoritesView ---
  const FavoritesView = () => {
    const favArticles = articles.filter(
      (a) => favorites.includes(a.id) && a.status === "published",
    );
    return (
      <div className="p-4 space-y-4 animate-in fade-in duration-300 min-h-[70vh]">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b-2 border-yellow-400 pb-2 inline-flex">
          <CustomStarIcon className="w-6 h-6" active={true} /> お気に入り
        </h2>
        {userRole === "guest" ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <CustomStarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 font-bold mb-2">ログインが必要です</p>
            <p className="text-sm text-gray-400 mb-6">
              お気に入り機能を利用するには
              <br />
              ログインしてください。
            </p>
            <button
              onClick={() => navigate("login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700"
            >
              ログインする
            </button>
          </div>
        ) : favArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
            <p className="text-gray-600 font-bold mb-2">登録されている記事がありません</p>
            <p className="text-sm text-gray-400 mb-6">
              好きな記事を見つけて☆アイコンをタップしましょう
            </p>
            <button
              onClick={() => navigate("home")}
              className="px-6 py-3 border-2 border-blue-500 text-blue-600 rounded-full font-bold hover:bg-blue-50"
            >
              記事を探す
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {favArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- SettingsView ---
  const SettingsView = () => (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 border-b-2 border-gray-300 pb-2 inline-flex">
        <CustomSettingsIcon className="w-6 h-6" active={true} /> 設定
      </h2>
      {userRole === "guest" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-blue-800 text-sm">ログインしていません</p>
            <p className="text-xs text-blue-600">ログインするとお気に入り機能が使えます</p>
          </div>
          <button
            onClick={() => navigate("login")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {userRole !== "guest" && (
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">
                {profile?.display_name ?? profile?.email}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === "editor" ? "編集長" : userRole === "writer" ? "ライター" : "閲覧者"}
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-200 hover:bg-red-100"
            >
              ログアウト
            </button>
          </div>
        )}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">文字の大きさ</p>
            <p className="text-xs text-gray-500 font-medium">記事本文の表示サイズ</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {["small", "medium", "large"].map((size, i) => {
              const labels = ["小", "中", "大"];
              return (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all font-bold ${fontSize === size ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {labels[i]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {userRole === "writer" && (
        <button
          onClick={() => navigate("writerDash")}
          className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between"
        >
          <span>ライター用ダッシュボードを開く</span>
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}
      {userRole === "editor" && (
        <button
          onClick={() => navigate("editorDash")}
          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between"
        >
          <span>編集長用ダッシュボードを開く</span>
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600 mb-2">ライターとして参加したい方は</p>
        <button
          onClick={() => navigate("register")}
          className="text-blue-600 font-bold text-sm underline hover:text-blue-800"
        >
          ライター登録はこちら
        </button>
      </div>
    </div>
  );

  // --- WriterDashboard ---
  const WriterDashboard = () => {
    const myArticles = articles.filter((a) => a.writerId === currentUserId);
    return (
      <div className="p-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("settings")}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">ライター管理</h2>
        </div>
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2">
            <CustomUserIcon className="w-5 h-5" /> プロフィール編集
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            自分のプロフィールや自己紹介文を編集できます。
          </p>
          <button
            onClick={() => showToast("プロフィール編集画面(モック)")}
            className="w-full py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> 編集する
          </button>
        </section>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">自分の記事</h3>
            <button
              onClick={() => showToast("新規作成画面(モック)")}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> 新規作成
            </button>
          </div>
          <div className="space-y-3">
            {myArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm pr-2">{article.title}</h4>
                  {article.status === "published" ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold shrink-0">
                      公開中
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold shrink-0">
                      申請中
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => showToast("記事編集(モック)")}
                    className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> 編集
                  </button>
                  {article.status !== "published" && (
                    <button
                      onClick={() => showToast("投稿申請しました")}
                      className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 border border-blue-200"
                    >
                      投稿申請
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // --- EditorDashboard ---
  const EditorDashboard = () => {
    const pendingArticles = articles.filter((a) => a.status === "pending");
    return (
      <div className="p-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("settings")}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-purple-800">編集長ダッシュボード</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => showToast("全記事管理(編集・削除)")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50"
          >
            全記事の
            <br />
            編集・削除
          </button>
          <button
            onClick={() => showToast("おすすめ/人気 設定")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50"
          >
            おすすめ・人気
            <br />
            設定
          </button>
          <button
            onClick={() => showToast("ライター追加・管理")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50 col-span-2 flex items-center justify-center gap-2"
          >
            <CustomUserIcon className="w-5 h-5" /> 新規ライターの追加
          </button>
        </div>
        <section>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" /> 投稿承認待ち (
            {pendingArticles.length}件)
          </h3>
          <div className="space-y-3">
            {pendingArticles.map((article) => (
              <div
                key={article.id}
                className="bg-orange-50 p-3 rounded-xl border border-orange-200"
              >
                <p className="font-bold text-gray-800 mb-1">{article.title}</p>
                <p className="text-xs text-gray-500 mb-3">
                  申請者: {MOCK_WRITERS.find((w) => w.id === article.writerId)?.name}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setArticles(
                        articles.map((a) =>
                          a.id === article.id ? { ...a, status: "published" } : a,
                        ),
                      );
                      showToast("記事を公開しました");
                    }}
                    className="flex-1 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> 許可 (公開)
                  </button>
                  <button
                    onClick={() => showToast("差し戻しました")}
                    className="flex-1 py-2 bg-white text-gray-600 border border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50"
                  >
                    確認・差し戻し
                  </button>
                </div>
              </div>
            ))}
            {pendingArticles.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6 bg-white rounded-xl border">
                現在、承認待ちの記事はありません。
              </p>
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- AboutView ---
  const AboutView = () => (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300 bg-white min-h-screen">
      <div className="text-center py-8">
        <LogoIcon className="w-20 h-20 mx-auto mb-4" />
        <img src={imgTitle} className="h-10 object-contain mx-auto mb-2" alt="SHARE Quest" />
        <p className="text-blue-600 font-bold">ー 学びの『楽しい！』をつなげる ー</p>
      </div>
      <div className="space-y-6">
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            SHARE Quest とは
          </h3>
          <p className="text-sm text-gray-600 leading-loose font-medium">
            ライターによって書かれる様々なジャンルの記事を通して、「学ぶことの楽しさや面白さ」を届けるウェブサイトです。
          </p>
        </div>
        <button
          onClick={() => navigate("home")}
          className="w-full py-3 bg-gray-100 font-bold rounded-xl text-gray-600 hover:bg-gray-200 mt-4"
        >
          ホームへ戻る
        </button>
      </div>
    </div>
  );

  const LoginView = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleLogin = async () => {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("メールアドレスまたはパスワードが間違っています");
      else nav("/");
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            ライター登録は
            <button onClick={() => nav("/register")} className="text-blue-600 underline ml-1">
              こちら
            </button>
          </p>
        </div>
      </div>
    );
  };

  const RegisterView = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleRegister = async () => {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) setError(error.message);
      else {
        alert("確認メールを送信しました。メールを確認してください。");
        nav("/login");
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6">ライター登録</h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="表示名"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="パスワード（6文字以上）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            すでにアカウントをお持ちの方は
            <button onClick={() => nav("/login")} className="text-blue-600 underline ml-1">
              ログイン
            </button>
          </p>
        </div>
      </div>
    );
  };

  // --- ヘッダー非表示判定 ---
  const hideHeader = ["article", "about", "writerDash", "editorDash", "login", "register"].includes(
    currentView,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10 text-gray-800 font-sans selection:bg-blue-200">
      {!hideHeader && <Header />}
      <main className="max-w-2xl mx-auto min-h-[80vh]">
        {currentView === "notFound" && <NotFoundView />}
        {currentView === "home" && <HomeView />}
        {currentView === "article" && <ArticleView />}
        {currentView === "search" && <SearchView />}
        {currentView === "writers" && <WritersView />}
        {currentView === "profile" && <ProfileView />}
        {currentView === "favorites" && <FavoritesView />}
        {currentView === "settings" && <SettingsView />}
        {currentView === "about" && <AboutView />}
        {currentView === "writerDash" && <WriterDashboard />}
        {currentView === "editorDash" && <EditorDashboard />}
        {currentView === "login" && <LoginView />}
        {currentView === "register" && <RegisterView />}
      </main>
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 text-sm font-bold whitespace-nowrap">
          {toastMessage}
          <button
            onClick={() => setToastMessage("")}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function NotFoundView() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <h1 style={{ fontSize: "72px", fontWeight: "bold", margin: 0 }}>404</h1>
      <p style={{ fontSize: "18px", color: "#666", margin: "16px 0 32px" }}>
        ページが見つかりませんでした
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 32px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        トップへ戻る
      </button>
    </div>
  );
}
