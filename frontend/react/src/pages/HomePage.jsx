import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { LogoMark } from "../components/LogoMark";
import { useC } from "../context/AppContext";
import { Av, FollowBtn, HomeReelCard, PostCard } from "../components/Shared";

const PAGE_SIZE = 8;
const CAN_OBSERVE = typeof IntersectionObserver !== "undefined";

function HomePage() {
  const { db, me, open, feed, blockedIds, suggestions } = useC();
  const now = Date.now();
  const oneDayAgo = now - 864e5;
  const homeItems = useMemo(
    () =>
      [
        ...feed.map((post) => ({ ...post, kind: "post" })),
        ...db.reels
          .filter((reel) => !blockedIds.has(reel.userId))
          .map((reel) => ({ ...reel, kind: "reel" })),
      ].sort((a, b) => b.t - a.t),
    [feed, db.reels, blockedIds],
  );
  // Feed bo‘laklab chiziladi: pastga tushganda keyingi postlar qo‘shiladi.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const hasMore = CAN_OBSERVE && visibleCount < homeItems.length;
  const shownItems = CAN_OBSERVE
    ? homeItems.slice(0, visibleCount)
    : homeItems;
  useEffect(() => {
    const node = sentinelRef.current;
    if (!hasMore || !node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          setVisibleCount((count) => count + PAGE_SIZE);
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);
  const activeStories = db.stories.filter(
    (s) => s.t > oneDayAgo && !blockedIds.has(s.userId),
  );
  const storyOwnerIds = new Set(activeStories.map((story) => story.userId));
  const storyUsers = [
    me,
    ...db.users.filter(
      (user) =>
        user.id !== me.id &&
        storyOwnerIds.has(user.id) &&
        !blockedIds.has(user.id),
    ),
  ];
  return (
    <div className="mx-auto flex max-w-[935px] justify-center gap-16 px-0 pt-2 sm:px-3 lg:pt-5">
      <section className="ig-feed w-full max-w-[630px]">
        {storyUsers.length > 0 && (
          <div className="ig-story-strip mb-3 p-3">
            <div className="no-scrollbar flex gap-4 overflow-x-auto">
              {storyUsers.map((u) => {
                const us = activeStories.filter((s) => s.userId === u.id);
                const unseen = us.some(
                  (s) =>
                    !db.seenStories.some(
                      (v) => v.viewerId === me.id && v.storyId === s.id,
                    ),
                );
                return (
                  <div
                    key={u.id}
                    className="relative w-[66px] shrink-0 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        us.length ? open.story(us[0].id) : open.createStory()
                      }
                      className="flex w-full flex-col items-center gap-1"
                    >
                      <Av
                        u={u}
                        s={56}
                        ring={us.length ? (u.id === me.id || unseen ? true : "seen") : false}
                      />
                      <span className="w-full truncate text-center">
                        {u.id === me.id ? "Sizning" : u.username}
                      </span>
                    </button>
                    {u.id === me.id && (
                      <button
                        type="button"
                        aria-label="Yangi story qo‘shish"
                        onClick={open.createStory}
                        className="absolute right-0 top-7 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#070b18] text-white !border-[#0b1020] !bg-[#d02aa8] !text-white"
                      >
                        <Plus size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {homeItems.length ? (
          <>
            {shownItems.map((item, index) => (
              <div
                key={`${item.kind}-${item.id}`}
                className={`bb-feed-in bb-accent-${index % 4}`}
                style={{ animationDelay: `${(index % PAGE_SIZE) * 50}ms` }}
              >
                {item.kind === "reel" ? (
                  <HomeReelCard r={item} />
                ) : (
                  <PostCard p={item} />
                )}
              </div>
            ))}
            {hasMore && (
              <div
                ref={sentinelRef}
                aria-hidden="true"
                className="h-10"
              />
            )}
          </>
        ) : (
          <div className="mt-10 text-center">
            <LogoMark size={88} className="mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">
              Hozircha postlar yo‘q
            </h2>
            <p className="mt-1 text-neutral-500">
              Do‘stlaringni follow qil yoki birinchi postni o‘zing joyla!
            </p>
            <button
              type="button"
              onClick={open.create}
              className="bb-chip bb-chip-pink mt-4"
            >
              <Plus size={18} />
              Post joylash
            </button>
          </div>
        )}
      </section>
      <aside className="hidden w-[320px] pt-7 lg:sticky lg:top-6 lg:block lg:self-start">
        <div className="flex items-center gap-3">
          <button onClick={() => open.profile(me.id)}>
            <Av u={me} s={56} />
          </button>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-sm">{me.username}</b>
            <span className="text-sm text-neutral-500">{me.name}</span>
          </div>
        </div>
        <div className="mb-3 mt-6 text-sm font-semibold text-neutral-500">
          Siz uchun takliflar
        </div>
        {suggestions.length ? (
          suggestions.slice(0, 6).map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2">
              <button onClick={() => open.profile(u.id)}>
                <Av u={u} s={40} />
              </button>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">{u.username}</b>
                <span className="block truncate text-xs text-neutral-500">
                  {u.name}
                </span>
              </div>
              <FollowBtn id={u.id} />
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500">
            Boshqa foydalanuvchilar hali yo‘q.
          </p>
        )}
      </aside>
    </div>
  );
}

export default HomePage;
