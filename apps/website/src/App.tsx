import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import type { Profile } from "./supabase";
import { ChevronLeft, Share2, Eye, X, Plus, Edit3, Check, AlertCircle } from "lucide-react";

type Series = {
  id: string;
  title: string;
  description?: string | null;
  writerId: string;
};

type Article = {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailUrl: string | null;
  thumbnailColor: string | null;
  writerId: string;
  views: number;
  likes: number;
  tags: string[];
  isRecommended: boolean;
  isPopular: boolean;
  status: "draft" | "pending" | "published";
  content?: string;
  summary?: string;
  seriesId?: string | null;
  episodeNumber?: number | null;
};
import imgLogo from "./assets/170805.jpg";
import imgTitle from "./assets/117_20260501195729.png";
import imgSearch from "./assets/118_20260501193319.png";
import imgUser from "./assets/119_20260501193952.png";
import imgStar from "./assets/120_20260501194440.png";
import imgSettings from "./assets/121_20260501195446.png";
import imgRecommend from "./assets/recommend_icon.png";

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

const MOCK_TAGS = ["理科", "歴史", "数学", "国語", "英語", "プログラミング", "雑学"];

const THUMBNAIL_COLORS = [
  { id: "blue", label: "ブルー", bg: "bg-blue-100", text: "text-blue-400" },
  { id: "green", label: "グリーン", bg: "bg-green-100", text: "text-green-400" },
  { id: "purple", label: "パープル", bg: "bg-purple-100", text: "text-purple-400" },
  { id: "orange", label: "オレンジ", bg: "bg-orange-100", text: "text-orange-400" },
  { id: "pink", label: "ピンク", bg: "bg-pink-100", text: "text-pink-400" },
  { id: "teal", label: "ティール", bg: "bg-teal-100", text: "text-teal-400" },
];
const getThumbnailColor = (colorId: string | null) =>
  THUMBNAIL_COLORS.find((c) => c.id === colorId) ?? THUMBNAIL_COLORS[0];

const VIEW_TO_PATH: Record<string, string> = {
  home: "/",
  search: "/search",
  settings: "/settings",
  writers: "/writers",
  favorites: "/favorites",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  writerDash: "/writer-dash",
  writerNew: "/writer-dash/new",
  writerEdit: "/writer-dash/edit",
  writerSeries: "/writer-dash/series",
  editorArticles: "/editor-dash/articles",
  editorRecommend: "/editor-dash/recommend",
  editorWriters: "/editor-dash/writers",
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
  if (pathname === "/privacy") return { currentView: "privacy", viewParam: null };
  if (pathname === "/terms") return { currentView: "terms", viewParam: null };
  if (pathname === "/contact") return { currentView: "contact", viewParam: null };
  if (pathname === "/writer-dash") return { currentView: "writerDash", viewParam: null };
  if (pathname === "/writer-dash/new") return { currentView: "writerNew", viewParam: null };
  if (pathname === "/writer-dash/series") return { currentView: "writerSeries", viewParam: null };
  const writerEditMatch = pathname.match(/^\/writer-dash\/edit\/(.+)$/);
  if (writerEditMatch) return { currentView: "writerEdit", viewParam: writerEditMatch[1] };
  if (pathname === "/editor-dash") return { currentView: "editorDash", viewParam: null };
  if (pathname === "/editor-dash/articles")
    return { currentView: "editorArticles", viewParam: null };
  if (pathname === "/editor-dash/recommend")
    return { currentView: "editorRecommend", viewParam: null };
  if (pathname === "/editor-dash/writers") return { currentView: "editorWriters", viewParam: null };
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
    void supabase.auth.getSession().then(({ data: { session } }) => {
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

  const currentUserId = profile?.id ?? "";
  const [writers, setWriters] = useState<Profile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  useEffect(() => {
    void supabase
      .from("series")
      .select("*")
      .then(({ data }) => {
        if (data) {
          setSeriesList(
            data.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description ?? null,
              writerId: s.writer_id,
            })),
          );
        }
      });
  }, []);

  useEffect(() => {
    void supabase
      .from("profiles")
      .select("*")
      .in("role", ["writer", "editor"])
      .then(({ data }) => {
        if (data) setWriters(data as Profile[]);
      });
  }, []);

  useEffect(() => {
    void supabase
      .from("articles")
      .select("*")
      .then(({ data }) => {
        if (data) {
          setArticles(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              thumbnail: a.thumbnail,
              thumbnailUrl: a.thumbnail_url ?? null,
              thumbnailColor: a.thumbnail_color ?? "blue",
              writerId: a.writer_id,
              views: a.views,
              likes: a.likes,
              tags: a.tags,
              isRecommended: a.is_recommended,
              isPopular: a.is_popular,
              status: a.status,
              content: a.content,
              seriesId: a.series_id ?? null,
              episodeNumber: a.episode_number ?? null,
            })),
          );
        }
      });
  }, []);
  const [fontSize, setFontSize] = useState("medium");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (userRole === "guest") return;
    void supabase
      .from("favorites")
      .select("article_id")
      .then(({ data }) => {
        if (data) setFavorites(data.map((f) => f.article_id));
      });
  }, [userRole]);

  // views カウントアップ
  useEffect(() => {
    console.log("views effect:", currentView, viewParam, articles.length);
    if (currentView !== "article" || !viewParam) return;
    const article = articles.find((a) => a.id === viewParam);
    console.log("views article:", article?.id, article?.views);
    if (!article) return;
    supabase
      .from("articles")
      .update({ views: article.views + 1 })
      .eq("id", article.id)
      .then(({ error, data }) => {
        console.log("views result:", data, error);
      });
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, views: a.views + 1 } : a)),
    );
  }, [currentView, viewParam]);

  // ページタイトル更新
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "SHARE Quest | 学びの『楽しい！』をつなげる",
      article: articles.find((a) => a.id === viewParam)?.title
        ? `${articles.find((a) => a.id === viewParam)!.title} | SHARE Quest`
        : "記事 | SHARE Quest",
      search: "検索 | SHARE Quest",
      writers: "ライター一覧 | SHARE Quest",
      profile: "プロフィール | SHARE Quest",
      favorites: "お気に入り | SHARE Quest",
      settings: "設定 | SHARE Quest",
      about: "About Us | SHARE Quest",
      writerDash: "記事を作成 | SHARE Quest",
      writerSeries: "連載管理 | SHARE Quest",
      writerNew: "新規記事作成 | SHARE Quest",
      writerEdit: "記事を編集 | SHARE Quest",
      editorDash: "編集長ダッシュボード | SHARE Quest",
      editorArticles: "全記事管理 | SHARE Quest",
      editorRecommend: "おすすめ設定 | SHARE Quest",
      editorWriters: "ライター管理 | SHARE Quest",
      login: "ログイン | SHARE Quest",
      register: "ライター登録 | SHARE Quest",
      privacy: "プライバシーポリシー | SHARE Quest",
      terms: "利用規約 | SHARE Quest",
      contact: "お問い合わせ | SHARE Quest",
      notFound: "404 | SHARE Quest",
    };

    const setMeta = (title: string, description: string) => {
      document.title = title;
      const setTag = (sel: string, attr: string, val: string) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(attr, val);
      };
      setTag('meta[name="description"]', "content", description);
      setTag('meta[property="og:title"]', "content", title);
      setTag('meta[property="og:description"]', "content", description);
      setTag('meta[name="twitter:title"]', "content", title);
      setTag('meta[name="twitter:description"]', "content", description);
    };

    if (currentView === "article" && viewParam) {
      const article = articles.find((a) => a.id === viewParam);
      if (article) {
        const desc = article.summary
          ? article.summary.slice(0, 120)
          : `${article.title} - SHARE Questの記事`;
        setMeta(`${article.title} | SHARE Quest`, desc);
        return;
      }
    }

    const defaultDesc =
      "SHARE Questは、学びの「楽しい！」をつなげる記事プラットフォームです。ライターと読者をつなぎ、知識と好奇心を共有します。";
    setMeta(titles[currentView] ?? "SHARE Quest", defaultDesc);
  }, [currentView, viewParam, articles]);

  const [toastMessage, setToastMessage] = useState("");
  if (authLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>
    );

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const navigate = (view: string, param: string | null = null) => {
    if (view === "profile" && param) {
      const w = writers.find((wr) => wr.id === param);
      nav(`/writers/${w?.username ?? param}`);
    } else if (view === "article" && param) nav(`/articles/${param}`);
    else if (view === "writerEdit" && param) nav(`/writer-dash/edit/${param}`);
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
      supabase
        .from("favorites")
        .delete()
        .eq("article_id", articleId)
        .then(({ error }) => {
          if (error) console.error("fav delete:", error);
        });
      setFavorites(favorites.filter((id) => id !== articleId));
      const curLikes1 = articles.find((a) => a.id === articleId)?.likes ?? 1;
      supabase
        .from("articles")
        .update({ likes: Math.max(0, curLikes1 - 1) })
        .eq("id", articleId)
        .then(({ error }) => {
          if (error) console.error("likes dec:", error);
        });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, likes: Math.max(0, a.likes - 1) } : a)),
      );
      showToast("お気に入りから削除しました");
    } else {
      supabase
        .from("favorites")
        .insert({ article_id: articleId, user_id: currentUserId })
        .then(({ error }) => {
          if (error) console.error("fav insert:", error);
        });
      setFavorites([...favorites, articleId]);
      const curLikes2 = articles.find((a) => a.id === articleId)?.likes ?? 0;
      supabase
        .from("articles")
        .update({ likes: curLikes2 + 1 })
        .eq("id", articleId)
        .then(({ error }) => {
          if (error) console.error("likes inc:", error);
        });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, likes: a.likes + 1 } : a)),
      );
      showToast("お気に入りに登録しました");
    }
  };

  // --- Header ---
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("home")}>
          <LogoIcon className="w-10 h-10" />
          <img
            src={imgTitle}
            className="h-10 object-contain hidden sm:inline-block"
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
    const writer = writers.find((w) => w.id === article.writerId);
    const isFav = favorites.includes(article.id);
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${layout === "horizontal" ? "flex h-28" : "flex flex-col"}`}
        onClick={() => navigate("article", article.id)}
      >
        {(() => {
          const color = getThumbnailColor(article.thumbnailColor ?? null);
          return article.thumbnailUrl ? (
            <div
              className={`${layout === "horizontal" ? "w-1/3 min-w-[110px] h-full" : "w-full"} overflow-hidden`}
              style={layout !== "horizontal" ? { aspectRatio: "16/9" } : {}}
            >
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`${color.bg} ${layout === "horizontal" ? "w-1/3 min-w-[110px]" : "w-full"} flex items-center justify-center`}
              style={layout !== "horizontal" ? { aspectRatio: "16/9" } : {}}
            >
              <LogoIcon className="w-10 h-10 opacity-40" />
            </div>
          );
        })()}
        <div
          className={`p-3 flex flex-col justify-between ${layout === "horizontal" ? "w-2/3" : "w-full"}`}
        >
          <h3 className="font-bold text-gray-800 line-clamp-2 text-sm md:text-base leading-snug">
            {article.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[70%]">
              <CustomUserIcon className="w-4 h-4" /> {writer?.display_name ?? writer?.email}
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
            <img src={imgRecommend} className="w-6 h-6 object-contain" alt="おすすめ" />{" "}
            おすすめの記事
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {published.filter((a) => a.isRecommended).length === 0 ? (
              <p className="text-gray-400 text-sm py-4">まだおすすめ記事はありません</p>
            ) : (
              published
                .filter((a) => a.isRecommended)
                .map((article) => (
                  <div key={article.id} className="min-w-[240px] snap-start">
                    <ArticleCard article={article} layout="vertical" />
                  </div>
                ))
            )}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-red-500 font-bold text-xl">🔥</span> 人気の記事
          </h2>
          <div className="space-y-3">
            {published.filter((a) => a.isPopular).length === 0 ? (
              <p className="text-gray-400 text-sm py-4">まだ人気記事はありません</p>
            ) : (
              published
                .filter((a) => a.isPopular)
                .map((article) => <ArticleCard key={article.id} article={article} />)
            )}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">記事一覧</h2>
          <div className="space-y-3">
            {published.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">まだ公開記事はありません</p>
            ) : (
              published.map((article) => <ArticleCard key={article.id} article={article} />)
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- ArticleView ---
  const ArticleView = () => {
    const article = articles.find((a) => a.id === viewParam);
    if (!article) return <div className="p-10 text-center">記事が見つかりません</div>;
    const writer = writers.find((w) => w.id === article.writerId);
    const isFav = favorites.includes(article.id);
    const articleUrl = `${window.location.origin}/articles/${article.id}`;
    const color = getThumbnailColor(article.thumbnailColor ?? null);
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
        {article.thumbnailUrl ? (
          <div className="w-full" style={{ aspectRatio: "16/9" }}>
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`${color.bg} w-full flex items-center justify-center`}
            style={{ aspectRatio: "16/9" }}
          >
            <LogoIcon className="w-20 h-20 opacity-20" />
          </div>
        )}
        <div className="p-4 space-y-5">
          {article.seriesId &&
            (() => {
              const series = seriesList.find((s) => s.id === article.seriesId);
              if (!series) return null;
              return (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    連載
                  </span>
                  <span className="text-sm font-bold text-blue-600">{series.title}</span>
                  {article.episodeNumber != null && (
                    <span className="text-xs text-gray-400">第{article.episodeNumber}話</span>
                  )}
                </div>
              );
            })()}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{article.title}</h1>
          {article.summary && (
            <div className="bg-blue-50 p-4 rounded-xl text-gray-700 border border-blue-100 font-medium">
              {article.summary}
            </div>
          )}
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
            {(article.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
          {writer && (
            <div
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50"
              onClick={() => navigate("profile", writer.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full border border-gray-200">
                  {writer.avatar_url ? (
                    <img
                      src={writer.avatar_url}
                      className="w-8 h-8 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <CustomUserIcon className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-0.5">この記事を書いた人</p>
                  <p className="font-bold text-gray-800">{writer.display_name ?? writer.email}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                プロフィールへ
              </span>
            </div>
          )}
          <div
            className={`py-4 text-gray-800 whitespace-pre-wrap leading-loose ${getFontSizeClass()}`}
          >
            {article.content ? (
              article.content
            ) : (
              <span className="text-gray-400 italic">本文はまだ書かれていません</span>
            )}
          </div>
          <div className="border-t pt-8 pb-4 space-y-4">
            <p className="font-bold text-gray-800 text-center">この記事を共有</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.title} | ${writer?.display_name ?? "SHARE Quest"} From SHARE Quest`)}&url=${encodeURIComponent(articleUrl)}`,
                    "_blank",
                  )
                }
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:opacity-80 shadow-md"
              >
                <span className="font-bold text-2xl">X</span>
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://line.me/R/msg/text/?${encodeURIComponent(`${article.title} | ${writer?.display_name ?? "SHARE Quest"} From SHARE Quest\n${articleUrl}`)}`,
                    "_blank",
                  )
                }
                className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center hover:opacity-80 shadow-md"
              >
                <span className="font-bold text-sm">LINE</span>
              </button>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(articleUrl);
                  showToast("リンクをコピーしました");
                }}
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
  const SearchView = () => {
    const [keyword, setKeyword] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedWriterIds, setSelectedWriterIds] = useState<string[]>([]);

    const allTags = Array.from(new Set(articles.flatMap((a) => a.tags ?? []))).filter(Boolean);
    const displayTags = allTags.length > 0 ? allTags : MOCK_TAGS;

    const results = articles.filter((a) => {
      if (a.status !== "published") return false;
      if (
        keyword &&
        !a.title.toLowerCase().includes(keyword.toLowerCase()) &&
        !(a.content ?? "").toLowerCase().includes(keyword.toLowerCase())
      )
        return false;
      if (selectedTags.length > 0 && !selectedTags.some((t) => (a.tags ?? []).includes(t)))
        return false;
      if (selectedWriterIds.length > 0 && !selectedWriterIds.includes(a.writerId)) return false;
      return true;
    });

    const toggleTag = (tag: string) =>
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    const toggleWriter = (id: string) =>
      setSelectedWriterIds((prev) =>
        prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
      );
    const hasFilter = keyword || selectedTags.length > 0 || selectedWriterIds.length > 0;

    return (
      <div className="p-4 space-y-4 animate-in fade-in duration-300">
        <div className="relative">
          <input
            type="text"
            placeholder="キーワードで検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
          />
          <div className="absolute left-3 top-3.5">
            <CustomSearchIcon className="w-7 h-7" />
          </div>
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">タグでしぼる</h3>
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 border rounded-lg text-sm font-bold transition-colors ${selectedTags.includes(tag) ? "bg-blue-500 border-blue-500 text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
        <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">ライターでしぼる</h3>
          <div className="grid grid-cols-2 gap-2">
            {writers.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWriter(w.id)}
                className={`flex items-center gap-2 p-2 border rounded-lg text-left transition-colors ${selectedWriterIds.includes(w.id) ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200"}`}
              >
                {w.avatar_url ? (
                  <img src={w.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                ) : (
                  <CustomUserIcon className="w-6 h-6" />
                )}
                <span className="text-sm font-bold text-gray-700 truncate">
                  {w.display_name ?? w.email}
                </span>
              </button>
            ))}
          </div>
        </section>
        {hasFilter && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-700">検索結果 ({results.length}件)</p>
              <button
                onClick={() => {
                  setKeyword("");
                  setSelectedTags([]);
                  setSelectedWriterIds([]);
                }}
                className="text-xs text-gray-500 underline"
              >
                フィルターをリセット
              </button>
            </div>
            <div className="space-y-3">
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-white rounded-xl border">
                  該当する記事が見つかりませんでした
                </p>
              ) : (
                results.map((a) => <ArticleCard key={a.id} article={a} />)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- WritersView ---
  const WritersView = () => {
    const editors = writers.filter((w) => w.role === "editor");
    const writerList = writers.filter((w) => w.role === "writer");
    const WriterRow = ({ w }: { w: Profile }) => (
      <div
        className="flex items-center justify-between p-4 bg-white border-b last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors"
        onClick={() => navigate("profile", w.id)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-full border border-gray-200 overflow-hidden w-12 h-12 flex items-center justify-center">
            {w.avatar_url ? (
              <img src={w.avatar_url} className="w-12 h-12 object-cover" alt="" />
            ) : (
              <CustomUserIcon className="w-8 h-8" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{w.display_name ?? w.email}</p>
            <p className="text-xs font-bold text-blue-500">
              {w.role === "editor" ? "編集長" : "ライター"}
            </p>
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
        {editors.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-gray-500 mb-2 pl-2">編集長</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {editors.map((w) => (
                <WriterRow key={w.id} w={w} />
              ))}
            </div>
          </section>
        )}
        <section>
          <h3 className="text-sm font-bold text-gray-500 mb-2 pl-2">ライター</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {writerList.length > 0 ? (
              writerList.map((w) => <WriterRow key={w.id} w={w} />)
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">ライターがまだいません</p>
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- ProfileView ---
  const ProfileView = () => {
    const writer = writers.find((w) => w.id === viewParam || w.username === viewParam);
    if (!writer)
      return <div className="p-10 text-center text-gray-500">プロフィールが見つかりません</div>;
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
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-xs font-bold">戻る</span>
          </button>
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
            {writer.avatar_url ? (
              <img src={writer.avatar_url} className="w-24 h-24 object-cover" alt="" />
            ) : (
              <CustomUserIcon className="w-16 h-16" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{writer.display_name ?? writer.email}</h2>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
            {writer.role === "editor" ? "編集長" : "ライター"}
          </span>
        </div>
        <div className="p-4 space-y-6 -mt-4 relative z-10">
          {writer.bio && (
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 text-gray-700 text-sm font-medium leading-relaxed">
              {writer.bio}
            </div>
          )}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded-lg">
                <LogoIcon className="w-5 h-5" />
              </span>
              この人の記事 ({writerArticles.length}件)
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
      {userRole !== "guest" && (
        <AvatarUpload
          profile={profile}
          onUpdate={(url) => setProfile((p) => (p ? { ...p, avatar_url: url } : p))}
        />
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {userRole !== "guest" && (
          <>
            <DisplayNameEdit
              profile={profile}
              setProfile={setProfile}
              setWriters={setWriters}
              showToast={showToast}
            />
            <UsernameEdit
              profile={profile}
              setProfile={setProfile}
              setWriters={setWriters}
              showToast={showToast}
            />
            {(userRole === "writer" || userRole === "editor") && (
              <BioEdit
                profile={profile}
                setProfile={setProfile}
                setWriters={setWriters}
                showToast={showToast}
              />
            )}
          </>
        )}
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
  const WriterSeriesPage = () => {
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const mySeries = seriesList.filter((s) => s.writerId === currentUserId);

    const handleCreate = async () => {
      if (!newTitle.trim()) {
        showToast("連載名を入力してください");
        return;
      }
      setSaving(true);
      const { data, error } = await supabase
        .from("series")
        .insert({
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          writer_id: currentUserId,
        })
        .select()
        .single();
      if (!error && data) {
        setSeriesList([
          ...seriesList,
          {
            id: data.id,
            title: data.title,
            description: data.description,
            writerId: data.writer_id,
          },
        ]);
        setNewTitle("");
        setNewDesc("");
        showToast("連載を作成しました");
      } else {
        alert("エラーが発生しました");
      }
      setSaving(false);
    };

    const handleDelete = async (id: string, title: string) => {
      if (
        !window.confirm(`「${title}」を削除しますか？\n連載に紐づく記事の連載設定は解除されます。`)
      )
        return;
      const { error } = await supabase.from("series").delete().eq("id", id);
      if (!error) {
        setSeriesList(seriesList.filter((s) => s.id !== id));
        setArticles(
          articles.map((a) =>
            a.seriesId === id ? { ...a, seriesId: null, episodeNumber: null } : a,
          ),
        );
        showToast("連載を削除しました");
      }
    };

    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("writerDash")}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">連載管理</h1>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800">新しい連載を作成</h2>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="連載名 *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="連載の説明（任意）"
            rows={3}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "作成中..." : "連載を作成"}
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">作成済みの連載</h2>
          {mySeries.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">連載はまだありません</p>
          ) : (
            mySeries.map((s) => {
              const count = articles.filter((a) => a.seriesId === s.id).length;
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-gray-900">{s.title}</p>
                    {s.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{count}件の記事</p>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id, s.title)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0"
                  >
                    削除
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const WriterDashboard = () => {
    const myArticles = articles.filter((a) => a.writerId === currentUserId);

    const openCreate = () => {
      navigate("writerNew");
    };
    const openSeriesManager = () => {
      navigate("writerSeries");
    };

    const openEdit = (article: Article) => {
      navigate("writerEdit", article.id);
    };

    const handleSubmit = async (article: Article) => {
      const { error } = await supabase
        .from("articles")
        .update({ status: "pending" })
        .eq("id", article.id);
      if (!error) {
        setArticles(articles.map((a) => (a.id === article.id ? { ...a, status: "pending" } : a)));
        showToast("投稿申請しました");
      } else {
        alert("エラーが発生しました");
      }
    };

    const handleDelete = async (article: Article) => {
      if (!window.confirm(`「${article.title}」を削除しますか？`)) return;
      const { error } = await supabase.from("articles").delete().eq("id", article.id);
      if (!error) {
        setArticles(articles.filter((a) => a.id !== article.id));
        showToast("記事を削除しました");
      } else {
        alert("エラーが発生しました");
      }
    };

    const statusLabel = (status: string) => {
      if (status === "published")
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold shrink-0">
            公開中
          </span>
        );
      if (status === "pending")
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold shrink-0">
            申請中
          </span>
        );
      return (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold shrink-0">
          下書き
        </span>
      );
    };

    return (
      <div className="p-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("settings")}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">記事を作成</h2>
        </div>

        {/* 記事一覧 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">自分の記事 ({myArticles.length}件)</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={openSeriesManager}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1 hover:bg-gray-200"
              >
                連載管理
              </button>
              <button
                onClick={openCreate}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> 新規作成
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {myArticles.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8 bg-white rounded-xl border">
                まだ記事がありません。「新規作成」から始めましょう！
              </p>
            )}
            {myArticles.map((article) => {
              const color = getThumbnailColor(article.thumbnailColor ?? null);
              return (
                <div
                  key={article.id}
                  className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3"
                >
                  <div
                    className={`${color.bg} w-14 h-14 rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <LogoIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-800 text-sm pr-2 truncate">
                        {article.title}
                      </h4>
                      {statusLabel(article.status)}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openEdit(article)}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> 編集
                      </button>
                      {article.status === "draft" && (
                        <button
                          onClick={() => void handleSubmit(article)}
                          className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 border border-blue-200"
                        >
                          投稿申請
                        </button>
                      )}
                      {article.status !== "published" && (
                        <button
                          onClick={() => void handleDelete(article)}
                          className="py-1.5 px-2 bg-red-50 text-red-500 text-xs font-bold rounded hover:bg-red-100 border border-red-200"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 記事作成・編集モーダル */}
      </div>
    );
  };

  // --- ArticleEditorPage ---
  const ArticleEditorPage = ({ editingId }: { editingId: string | null }) => {
    const editingArticle = editingId ? (articles.find((a) => a.id === editingId) ?? null) : null;
    const [formTitle, setFormTitle] = useState(editingArticle?.title ?? "");
    const [formContent, setFormContent] = useState(editingArticle?.content ?? "");
    const [formColor, setFormColor] = useState(editingArticle?.thumbnailColor ?? "blue");
    const [tags, setTags] = useState<string[]>(editingArticle?.tags ?? []);
    const [formSeriesId, setFormSeriesId] = useState(editingArticle?.seriesId ?? "");
    const [formEpisodeNumber, setFormEpisodeNumber] = useState(
      editingArticle?.episodeNumber != null ? String(editingArticle.episodeNumber) : "",
    );
    const [tagInput, setTagInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
      editingArticle?.thumbnailUrl ?? null,
    );
    const [thumbnailUploading, setThumbnailUploading] = useState(false);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        showToast("10MB以下の画像を選択してください");
        return;
      }
      setThumbnailUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${currentUserId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
        setThumbnailUrl(data.publicUrl);
        showToast("画像をアップロードしました");
      } else {
        showToast("アップロードに失敗しました");
      }
      setThumbnailUploading(false);
    };

    const addTag = (val: string) => {
      const newTags = val
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t && !tags.includes(t));
      if (newTags.length) setTags([...tags, ...newTags]);
      setTagInput("");
    };
    const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

    const handleSave = async () => {
      if (!formTitle.trim()) {
        showToast("タイトルを入力してください");
        return;
      }
      setSaving(true);
      if (editingArticle) {
        const { error } = await supabase
          .from("articles")
          .update({
            title: formTitle,
            content: formContent,
            tags,
            thumbnail_color: formColor,
            thumbnail_url: thumbnailUrl,
            series_id: formSeriesId || null,
            episode_number: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
          })
          .eq("id", editingArticle.id);
        if (!error) {
          setArticles(
            articles.map((a) =>
              a.id === editingArticle.id
                ? {
                    ...a,
                    title: formTitle,
                    content: formContent,
                    tags,
                    thumbnailColor: formColor,
                    thumbnailUrl: thumbnailUrl,
                    seriesId: formSeriesId || null,
                    episodeNumber: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
                  }
                : a,
            ),
          );
          showToast("記事を更新しました");
          navigate("writerDash");
        } else {
          alert("エラーが発生しました");
        }
      } else {
        const { data, error } = await supabase
          .from("articles")
          .insert({
            title: formTitle,
            content: formContent,
            tags,
            thumbnail_color: formColor,
            thumbnail_url: thumbnailUrl,
            writer_id: currentUserId,
            status: "draft",
            views: 0,
            likes: 0,
            is_recommended: false,
            is_popular: false,
            series_id: formSeriesId || null,
            episode_number: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
          })
          .select()
          .single();
        if (!error && data) {
          setArticles([
            ...articles,
            {
              id: data.id,
              title: data.title,
              thumbnail: "",
              thumbnailColor: formColor,
              thumbnailUrl: thumbnailUrl,
              writerId: data.writer_id,
              views: 0,
              likes: 0,
              tags,
              isRecommended: false,
              isPopular: false,
              status: "draft",
              content: formContent,
              seriesId: formSeriesId || null,
              episodeNumber: formEpisodeNumber ? parseInt(formEpisodeNumber) : null,
            },
          ]);
          showToast("下書きを保存しました");
          navigate("writerDash");
        } else {
          alert("エラーが発生しました");
        }
      }
      setSaving(false);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("writerDash")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {editingArticle ? "記事を編集" : "新規記事作成"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${showPreview ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"}`}
            >
              {showPreview ? "編集" : "プレビュー"}
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : editingArticle ? "更新" : "下書き保存"}
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {showPreview ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div
                className={`w-full h-40 rounded-xl mb-4 flex items-center justify-center ${getThumbnailColor(formColor).bg}`}
              >
                <LogoIcon className="w-16 h-16 opacity-20" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {formTitle || <span className="text-gray-400">（タイトル未入力）</span>}
              </h2>
              <div className="flex flex-wrap gap-1 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-700 leading-loose whitespace-pre-wrap">
                {formContent || <span className="text-gray-400">（本文未入力）</span>}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">連載</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formSeriesId}
                    onChange={(e) => setFormSeriesId(e.target.value)}
                  >
                    <option value="">連載なし（単発記事）</option>
                    {seriesList
                      .filter((s) => s.writerId === currentUserId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                  </select>
                </div>
                {formSeriesId && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">話数</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="例: 1"
                      value={formEpisodeNumber}
                      onChange={(e) => setFormEpisodeNumber(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="記事のタイトルを入力"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    サムネイルカラー
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {THUMBNAIL_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setFormColor(color.id)}
                        className={`w-10 h-10 rounded-full ${color.bg} border-4 transition-all ${formColor === color.id ? "border-gray-700 scale-110" : "border-transparent"}`}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    選択中: {getThumbnailColor(formColor).label}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    サムネイル画像{" "}
                    <span className="text-gray-400 font-normal text-xs">(推奨: 1920×1080px)</span>
                  </label>
                  {thumbnailUrl && (
                    <div
                      className="mb-2 rounded-xl overflow-hidden border border-gray-200"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={thumbnailUrl}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 cursor-pointer border border-gray-200">
                      {thumbnailUploading
                        ? "アップロード中..."
                        : thumbnailUrl
                          ? "画像を変更"
                          : "画像をアップロード"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleThumbnailUpload(e)}
                        disabled={thumbnailUploading}
                      />
                    </label>
                    {thumbnailUrl && (
                      <button
                        onClick={() => setThumbnailUrl(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">JPG / PNG · 10MB以下</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">タグ</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[28px]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500 font-bold leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="タグを入力（Enterまたはカンマで追加）"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                    />
                    <button
                      onClick={() => addTag(tagInput)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700"
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">本文</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-loose"
                  rows={24}
                  placeholder="記事の本文を入力してください"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
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
        {userRole === "editor" && (
          <button
            onClick={() => navigate("writerDash")}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-md flex items-center justify-between mb-4"
          >
            <span>記事を書く（ライター機能）</span>
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        )}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("editorArticles")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50"
          >
            全記事の
            <br />
            編集・削除
          </button>
          <button
            onClick={() => navigate("editorRecommend")}
            className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm text-center font-bold text-purple-700 hover:bg-purple-50"
          >
            おすすめ・人気
            <br />
            設定
          </button>
          <button
            onClick={() => navigate("editorWriters")}
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
                  申請者: {writers.find((w) => w.id === article.writerId)?.display_name ?? "不明"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("articles")
                        .update({ status: "published" })
                        .eq("id", article.id);
                      if (!error) {
                        setArticles(
                          articles.map((a) =>
                            a.id === article.id ? { ...a, status: "published" } : a,
                          ),
                        );
                        showToast("記事を公開しました");
                      } else {
                        alert("エラーが発生しました");
                      }
                    }}
                    className="flex-1 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> 許可 (公開)
                  </button>
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("articles")
                        .update({ status: "draft" })
                        .eq("id", article.id);
                      if (!error) {
                        setArticles(
                          articles.map((a) =>
                            a.id === article.id ? { ...a, status: "draft" } : a,
                          ),
                        );
                        showToast("差し戻しました");
                      } else {
                        alert("エラーが発生しました");
                      }
                    }}
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
          <p className="text-sm text-gray-600 leading-loose">
            　「学びの『楽しい！』をつなげる」をモットーに、ライターによって書かれる記事から、「学ぶこと」の楽しさや面白さを届けるコンテンツです。
          </p>
          <p className="text-sm text-gray-600 leading-loose mt-2">
            　「勉強」という固い縛りではなく、「気になったことを広げたい」、「学ぶこと自体が楽しい」と思えるようなコンテンツを目指しています。
          </p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            主な活動
          </h3>
          <p className="text-sm text-gray-600 leading-loose">
            　SHARE
            Questのライターが、「楽しい」「おもしろい」と感じたことを記事にすることで、その輪を広げています。
          </p>
          <p className="text-sm text-gray-600 leading-loose mt-2">
            　一人でも多くの方に学びの楽しさを伝えられるよう活動しています。
          </p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            ライター
          </h3>
          <div className="mb-3">
            <span className="inline-block text-xs font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full mb-2">
              編集長
            </span>
            <p className="text-sm text-gray-700 font-bold pl-1">三上 瑠衣　-MIKAMI Rui-</p>
          </div>
          <div>
            <span className="inline-block text-xs font-bold text-white bg-gray-400 px-2 py-0.5 rounded-full mb-2">
              ライター
            </span>
            <ul className="text-sm text-gray-600 space-y-1 pl-1">
              <li>天羽 楽　-TENBA Gaku-</li>
              <li>るーと　-Root-</li>
            </ul>
          </div>
          <button
            onClick={() => navigate("writers")}
            className="mt-3 text-sm text-blue-500 font-bold underline hover:text-blue-700"
          >
            ＞ 編集者一覧へ
          </button>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-3 inline-block">
            協力者
          </h3>
          <p className="text-sm text-gray-600">・Noimzip</p>
        </div>
        <button
          onClick={() => navigate("home")}
          className="w-full py-3 bg-gray-100 font-bold rounded-xl text-gray-600 hover:bg-gray-200"
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
          <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-xs text-gray-600 mb-2 font-medium">ライターとして投稿したい方は</p>
            <a
              href="https://x.com/SHARE_Quest_Off"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @SHARE_Quest_Off にDMで応募
            </a>
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
  const hideHeader = [
    "article",
    "writerDash",
    "writerNew",
    "writerEdit",
    "editorDash",
    "editorArticles",
    "editorRecommend",
    "editorWriters",
    "login",
    "register",
  ].includes(currentView);

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
        {currentView === "writerNew" && (userRole === "writer" || userRole === "editor") && (
          <ArticleEditorPage editingId={null} />
        )}
        {currentView === "writerEdit" && (userRole === "writer" || userRole === "editor") && (
          <ArticleEditorPage editingId={viewParam} />
        )}
        {currentView === "writerDash" && (userRole === "writer" || userRole === "editor") && (
          <WriterDashboard />
        )}
        {currentView === "writerSeries" && (userRole === "writer" || userRole === "editor") && (
          <WriterSeriesPage />
        )}
        {currentView === "editorDash" && <EditorDashboard />}
        {currentView === "editorArticles" && <EditorArticlesView />}
        {currentView === "editorRecommend" && <EditorRecommendView />}
        {currentView === "editorWriters" && <EditorWritersView />}
        {currentView === "login" && <LoginView />}
        {currentView === "register" && <RegisterView />}
        {currentView === "privacy" && <PrivacyView />}
        {currentView === "terms" && <TermsView />}
        {currentView === "contact" && <ContactView />}
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 mt-8">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("home")}
              >
                <LogoIcon className="w-9 h-9" />
                <img src={imgTitle} className="h-6 object-contain" alt="SHARE Quest" />
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed max-w-xs">
                学びの「楽しい！」をつなげる、
                <br />
                ライターと読者をつなぐ記事プラットフォーム
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: "About Us", view: "about" },
                { label: "プライバシーポリシー", view: "privacy" },
                { label: "利用規約", view: "terms" },
                { label: "お問い合わせ", view: "contact" },
              ].map(({ label, view }) => (
                <button
                  key={view}
                  onClick={() => navigate(view)}
                  className="text-xs text-gray-500 hover:text-blue-600 hover:underline transition-colors font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/SHARE_Quest_Off"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @SHARE_Quest_Off
              </a>
              <a
                href="https://x.com/SHARE_Quest_Off"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors font-medium"
              >
                ライター応募はXのDMへ →
              </a>
            </div>
            <div className="w-full border-t border-gray-200 pt-4 text-center">
              <p className="text-xs text-gray-400">© 2026 SHARE Quest. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
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

function EditorArticlesView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    void supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data)
          setArticles(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              thumbnail: a.thumbnail,
              thumbnailUrl: a.thumbnail_url ?? null,
              thumbnailColor: a.thumbnail_color ?? "blue",
              writerId: a.writer_id,
              views: a.views,
              likes: a.likes,
              tags: a.tags,
              isRecommended: a.is_recommended,
              isPopular: a.is_popular,
              status: a.status,
              content: a.content,
            })),
          );
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この記事を削除しますか？")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (!error) setArticles(articles.filter((a) => a.id !== id));
  };

  const statusLabel = (s: string) =>
    s === "published" ? "公開中" : s === "pending" ? "承認待ち" : "下書き";
  const statusColor = (s: string) =>
    s === "published"
      ? "text-green-600 bg-green-50"
      : s === "pending"
        ? "text-orange-600 bg-orange-50"
        : "text-gray-500 bg-gray-100";

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => nav("/editor-dash")} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-purple-800">全記事の編集・削除</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {articles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">記事がありません</p>
          ) : (
            articles.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{a.title}</p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor(a.status)}`}
                    >
                      {statusLabel(a.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EditorRecommendView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    void supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .then(({ data }) => {
        if (data)
          setArticles(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              thumbnail: a.thumbnail,
              thumbnailUrl: a.thumbnail_url ?? null,
              thumbnailColor: a.thumbnail_color ?? "blue",
              writerId: a.writer_id,
              views: a.views,
              likes: a.likes,
              tags: a.tags,
              isRecommended: a.is_recommended,
              isPopular: a.is_popular,
              status: a.status,
              content: a.content,
            })),
          );
        setLoading(false);
      });
  }, []);

  const toggle = async (id: string, field: "is_recommended" | "is_popular", current: boolean) => {
    const { error } = await supabase
      .from("articles")
      .update({ [field]: !current })
      .eq("id", id);
    if (!error)
      setArticles(
        articles.map((a) =>
          a.id === id
            ? {
                ...a,
                isRecommended: field === "is_recommended" ? !current : a.isRecommended,
                isPopular: field === "is_popular" ? !current : a.isPopular,
              }
            : a,
        ),
      );
  };

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => nav("/editor-dash")} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-purple-800">おすすめ・人気設定</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="font-bold text-gray-800 text-sm mb-3">{a.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(a.id, "is_recommended", a.isRecommended)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${a.isRecommended ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-500 border-gray-200"}`}
                >
                  おすすめ {a.isRecommended ? "✓" : ""}
                </button>
                <button
                  onClick={() => toggle(a.id, "is_popular", a.isPopular)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${a.isPopular ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200"}`}
                >
                  人気 {a.isPopular ? "✓" : ""}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorWritersView() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState<"" | "viewer" | "writer" | "editor">("");
  const nav = useNavigate();

  const fetchAll = () => {
    setLoading(true);
    void supabase
      .from("profiles")
      .select("*")
      .order("role", { ascending: true })
      .then(({ data }) => {
        if (data) setAllProfiles(data as Profile[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const changeRole = async (id: string, role: "viewer" | "writer" | "editor") => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (!error) setAllProfiles(allProfiles.map((w) => (w.id === id ? { ...w, role } : w)));
  };

  const promoteWriter = async (email: string) => {
    if (!email.trim()) return;
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.trim())
      .single();
    if (fetchError || !data) {
      alert("ユーザーが見つかりません。先にアカウント登録が必要です。");
      return;
    }
    const { error } = await supabase.from("profiles").update({ role: "writer" }).eq("id", data.id);
    if (error) {
      alert("エラーが発生しました");
      return;
    }
    const updated = { ...data, role: "writer" as const };
    setAllProfiles((prev) =>
      prev.find((w) => w.id === data.id)
        ? prev.map((w) => (w.id === data.id ? updated : w))
        : [...prev, updated],
    );
    alert(`${data.display_name ?? data.email} をライターに昇格しました`);
  };

  const [newEmail, setNewEmail] = useState("");

  const filtered = allProfiles.filter((w) => {
    const emailMatch =
      searchEmail === "" || w.email.toLowerCase().includes(searchEmail.toLowerCase());
    const roleMatch = searchRole === "" || w.role === searchRole;
    return emailMatch && roleMatch;
  });

  const roleLabel: Record<string, string> = {
    viewer: "閲覧者",
    writer: "ライター",
    editor: "編集長",
  };
  const roleColor: Record<string, string> = {
    viewer: "bg-gray-100 text-gray-600",
    writer: "bg-blue-100 text-blue-700",
    editor: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-4 space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => nav("/editor-dash")} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-purple-800">ライター管理</h2>
        <span className="ml-auto text-xs text-gray-400">{allProfiles.length} アカウント</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <p className="font-bold text-gray-800 text-sm">メアドでライターに昇格</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="メールアドレス"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={() => {
              void promoteWriter(newEmail);
              setNewEmail("");
            }}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
          >
            昇格
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
        <p className="font-bold text-gray-800 text-sm">絞り込み</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="メアドで検索"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value as "" | "viewer" | "writer" | "editor")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">すべて</option>
            <option value="viewer">閲覧者</option>
            <option value="writer">ライター</option>
            <option value="editor">編集長</option>
          </select>
          {(searchEmail || searchRole) && (
            <button
              onClick={() => {
                setSearchEmail("");
                setSearchRole("");
              }}
              className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {w.display_name ?? "（名前未設定）"}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[w.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {roleLabel[w.role] ?? w.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{w.email}</p>
              </div>
              <select
                value={w.role}
                onChange={(e) =>
                  void changeRole(w.id, e.target.value as "viewer" | "writer" | "editor")
                }
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none shrink-0"
              >
                <option value="viewer">閲覧者</option>
                <option value="writer">ライター</option>
                <option value="editor">編集長</option>
              </select>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">
              {allProfiles.length === 0
                ? "登録アカウントがありません"
                : "条件に一致するアカウントがありません"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DisplayNameEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", profile.id);
    if (!error) {
      setProfile((p) => (p ? { ...p, display_name: name } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, display_name: name } : w)));
      setEditing(false);
      showToast("表示名を更新しました");
    }
    setSaving(false);
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">表示名</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "…" : "保存"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
          >
            取消
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">{profile?.display_name ?? "（未設定）"}</p>
          <button
            onClick={() => {
              setName(profile?.display_name ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}

function UsernameEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [uname, setUname] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const handleSave = async () => {
    if (!profile) return;
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      setErr("半角英数字・アンダースコアのみ。3〜20文字で入力してください");
      return;
    }
    setSaving(true);
    setErr("");
    const { error } = await supabase
      .from("profiles")
      .update({ username: uname })
      .eq("id", profile.id);
    if (error) {
      setErr("このユーザー名はすでに使われています");
    } else {
      setProfile((p) => (p ? { ...p, username: uname } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, username: uname } : w)));
      setEditing(false);
      showToast("ユーザー名を更新しました");
    }
    setSaving(false);
  };
  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">
        ユーザー名 <span className="text-gray-400 font-normal">(@username)</span>
      </p>
      {editing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-400">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input
                className="flex-1 text-sm focus:outline-none"
                value={uname}
                onChange={(e) => {
                  setUname(e.target.value);
                  setErr("");
                }}
                placeholder="例: taro_yamada"
              />
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setErr("");
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
            >
              取消
            </button>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <p className="text-xs text-gray-400">
            半角英数字・アンダースコア3〜20文字。プロフィーURLに使われます。
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">
            {profile?.username ? `@${profile.username}` : "（未設定）"}
          </p>
          <button
            onClick={() => {
              setUname(profile?.username ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
function BioEdit({
  profile,
  setProfile,
  setWriters,
  showToast,
}: {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ bio }).eq("id", profile.id);
    if (!error) {
      setProfile((p) => (p ? { ...p, bio } : p));
      setWriters((ws) => ws.map((w) => (w.id === profile.id ? { ...w, bio } : w)));
      setEditing(false);
      showToast("自己紹介を更新しました");
    } else {
      alert("エラーが発生しました");
    }
    setSaving(false);
  };
  return (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs text-gray-500 mb-1 font-bold">自己紹介</p>
      {editing ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="あなたの自己紹介を入力してください"
            maxLength={300}
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/300文字</p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setBio(profile?.bio ?? "");
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1 whitespace-pre-wrap">
            {profile?.bio ? profile.bio : <span className="text-gray-400">（未設定）</span>}
          </p>
          <button
            onClick={() => {
              setBio(profile?.bio ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-500 font-bold underline shrink-0"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
function AvatarUpload({
  profile,
  onUpdate,
}: {
  profile: Profile | null;
  onUpdate: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("2MB以下の画像を選択してください");
      return;
    }

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const filePath = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(`アップロードに失敗しました: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl + "?t=" + Date.now();

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
    onUpdate(publicUrl);
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="font-bold text-gray-800 mb-3">アイコン画像</p>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-400">👤</span>
          )}
        </div>
        <div className="flex-1">
          <label
            className={`inline-block px-4 py-2 rounded-lg text-sm font-bold cursor-pointer border-2 transition-all ${uploading ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-white text-blue-600 border-blue-500 hover:bg-blue-50"}`}
          >
            {uploading ? "アップロード中..." : "画像を変更"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG / PNG / GIF・2MB以下</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
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

function PrivacyView() {
  const nav = useNavigate();
  const sections: { title: string; text?: string; items?: string[] }[] = [
    {
      title: "1. 収集する情報",
      items: [
        "会員登録時に提供いただくメールアドレスおよび表示名",
        "任意でアップロードいただくプロフィールアイコン画像",
        "記事の閲覧数などのサービス利用に関するデータ",
      ],
    },
    {
      title: "2. 利用目的",
      items: [
        "サービスのご提供および運営・改善",
        "本人確認およびアカウント管理",
        "サービスに関する重要なお知らせの送信",
      ],
    },
    {
      title: "3. 第三者への提供",
      text: "当サービスは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供・開示しません。",
    },
    {
      title: "4. 情報の管理",
      text: "収集した情報はSupabaseを通じて安全に管理されます。不正アクセスや漏洱を防ぐため、適切な技術的措置を講じています。",
    },
    {
      title: "5. Cookieについて",
      text: "当サービスは、認証セッションの維持のためCookieを使用することがあります。ブラウザ設定で無効化可能ですが、一部機能をご利用いただけない場合があります。",
    },
    {
      title: "6. ポリシーの変更",
      text: "本プライバシーポリシーは、必要に応じて変更することがあります。重要な変更がある場合はサービス内でお知らせします。",
    },
  ];
  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-1 text-blue-100 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
          <h2 className="text-2xl font-bold">プライバシーポリシー</h2>
          <p className="text-blue-100 text-xs mt-1">最終更新日：2026年5月</p>
        </div>
        <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
          <p>
            SHARE
            Quest（以下「当サービス」）は、ユーザーの個人情報を適切に管理・保護することを最優先に考えています。
          </p>
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{s.title}</h3>
              {s.items ? (
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">{s.text}</p>
              )}
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-1">お問い合わせ窓口</h3>
            <p>プライバシーに関するご質問はお問い合わせページからお気軽にどうぞ。</p>
            <button
              onClick={() => nav("/contact")}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
            >
              お問い合わせはこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function TermsView() {
  const nav = useNavigate();
  const sections: { title: string; text?: string; items?: string[] }[] = [
    {
      title: "1. サービスの目的",
      text: "当サービスは、学びの楽しさを共有することを目的とした記事プラットフォームです。ライターが執筆した記事を通じて、多くの方に学びの魅力を届けることを目指しています。",
    },
    {
      title: "2. 禁止事項",
      items: [
        "他のユーザーへの訹謗中傷・嫌がらせ行為",
        "虚偽・不正確な情報の意図的な投稿",
        "第三者の著作権・知的財産権を侵害するコンテンツの投稿",
        "スパムや広告目的のコンテンツの投稿",
        "当サービスの運営を妨害する一切の行為",
        "法令に違反する行為",
      ],
    },
    {
      title: "3. 知的財産権",
      text: "当サービス上のコンテンツ（記事・デザイン・ロゴ等）の著作権は、各ライターまたは当サービスに帰属します。無断転載・複製は禁止します。",
    },
    {
      title: "4. 免責事項",
      text: "当サービスは、掃載されている記事の正確性・完全性を保証しません。記事の内容はライター個人の見解であり、当サービスの公式見解ではありません。",
    },
    {
      title: "5. アカウントの管理",
      text: "ユーザーは自身のアカウント情報を適切に管理する責任を負います。アカウントの不正利用により生じた損害について、当サービスは責任を負いません。",
    },
    {
      title: "6. サービスの変更・終了",
      text: "当サービスは、事前の通知なくサービス内容の変更や終了を行う場合があります。",
    },
    {
      title: "7. 規約の変更",
      text: "当サービスは、必要に応じて本利用規約を変更することがあります。変更後も引き続きご利用いただいた場合、変更後の規約に同意したものとみなします。",
    },
  ];
  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-purple-600 rounded-2xl p-6 mb-6 text-white">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-1 text-purple-100 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
          <h2 className="text-2xl font-bold">利用規約</h2>
          <p className="text-purple-100 text-xs mt-1">最終更新日：2026年5月</p>
        </div>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            SHARE
            Quest（以下「当サービス」）をご利用いただく前に、以下の利用規約をお読みください。サービスをご利用いただくことで、本規約に同意したものとみなします。
          </p>
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{s.title}</h3>
              {s.items ? (
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">{s.text}</p>
              )}
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p>規約に関するご質問はお問い合わせページからお気軽にどうぞ。</p>
            <button
              onClick={() => nav("/contact")}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
            >
              お問い合わせはこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ContactView() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !body.trim()) {
      setErr("すべての項目を入力してください");
      return;
    }
    setSending(true);
    setErr("");
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject, body });
    setSending(false);
    if (error) {
      setErr("送信に失敗しました。しばらくたってから再度お試しください。");
      return;
    }
    setSent(true);
  };
  if (sent) {
    return (
      <div className="p-4 sm:p-8 bg-white min-h-screen">
        <div className="max-w-xl mx-auto text-center pt-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">送信完了</h2>
          <p className="text-sm text-gray-500 mb-8">
            お問い合わせを受け付けました。返信までしばらくお待ちください。
          </p>
          <button
            onClick={() => nav(-1)}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-green-600 rounded-2xl p-6 mb-6 text-white">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-1 text-green-100 hover:text-white text-sm mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
          <h2 className="text-2xl font-bold">お問い合わせ</h2>
          <p className="text-green-100 text-sm mt-1">
            ご質問・ご意見・不具合のご報告などはこちらから。
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田 太郎"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="例: example@email.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例: 記事の内容について"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="お問い合わせ内容をご記入ください"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button
            onClick={() => void handleSend()}
            disabled={sending}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {sending ? "送信中..." : "送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}
