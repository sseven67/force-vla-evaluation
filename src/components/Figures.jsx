import React, { useState } from "react";
import { External } from "./ui.jsx";

export function Figure({ figure, compact = false }) {
  const [failed, setFailed] = useState(false);
  if (!figure) return null;
  return (
    <figure className={"paper-figure " + (compact ? "compact" : "")}>
      {!failed ? (
        <a href={figure.source} target="_blank" rel="noreferrer">
          <img
            src={figure.url}
            alt={figure.caption}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </a>
      ) : (
        <div className="image-fallback">原图暂未加载，可打开原文查看</div>
      )}
      <figcaption>
        <External href={figure.source}>{figure.caption}</External>
        <span>论文原图，版权归原作者</span>
      </figcaption>
    </figure>
  );
}

export function TaskSketch({ type }) {
  return (
    <div className={"task-sketch " + type}>
      <svg viewBox="0 0 480 210" aria-hidden="true">
        <defs>
          <pattern
            id={"grid-" + type}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0H0V30"
              fill="none"
              stroke="#d8e3ed"
              strokeWidth=".7"
            />
          </pattern>
        </defs>
        <rect width="480" height="210" fill={"url(#grid-" + type + ")"} />
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {type === "assembly" ? (
            <>
              <circle cx="210" cy="115" r="38" />
              <circle cx="210" cy="115" r="12" />
              <circle cx="280" cy="90" r="29" />
              <circle cx="280" cy="90" r="9" />
              {Array.from({ length: 12 }, (_, i) => (
                <path
                  key={i}
                  d="M210 68v10"
                  transform={`rotate(${i * 30} 210 115)`}
                />
              ))}
              <path d="M145 170h200M330 65v78M318 135l12 12 12-12M100 70h38l28 28" />
            </>
          ) : type === "weigh" ? (
            <>
              <path d="M240 46v120M165 166h150M145 79h190M162 79l-30 59h62zM317 79l-30 59h62z" />
              <circle cx="240" cy="71" r="8" />
              <path d="M150 119v-15h24v15M303 112h27" />
            </>
          ) : type === "medical" ? (
            <>
              <path d="M125 152c55-25 155-27 230 0M235 67l28 13-22 47-28-12zM243 50l14-30M227 118l-24 25M259 93l25 26M180 55h-48v51h30" />
              <path d="M138 82l7-7 6 9 9-14" />
            </>
          ) : type === "grasp" ? (
            <>
              <path d="M150 60v40l30 24v25M330 60v40l-30 24v25M185 143h15v-35h-15M280 143h15v-35h-15" />
              <ellipse cx="240" cy="125" rx="29" ry="41" />
              <path d="M215 179h50M182 121l-18 0M298 121h18" />
            </>
          ) : type === "wipe" ? (
            <>
              <path d="M130 55h210v115H130zM187 106l58-14 12 38-58 14zM228 96l-7-33 29-23M153 148h92M268 79h41M268 102h35" />
            </>
          ) : (
            <>
              <path d="M180 50v30l40 25v25h40v-25l40-25V50M227 130v30h26v-30M175 180h130M217 180v-10h46v10M236 145v10M234 193h15" />
            </>
          )}
        </g>
        <text x="28" y="188" fill="#8295aa" fontSize="11">
          任务类型示意 · 非论文实验图
        </text>
      </svg>
    </div>
  );
}

export function CategoryVisual({ group: g }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <TaskSketch type={g.icon} />
      <img
        className={loaded ? "loaded" : ""}
        src={g.image.url}
        alt={g.image.caption}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
    </>
  );
}
