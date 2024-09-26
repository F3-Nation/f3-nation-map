import React from "react";
import DOMPurify from "dompurify";

const urlRegex = /https?:\/\/[^\s]+/g;

export default function textLink(text: string): JSX.Element {
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) ?? [];

  const result = parts.reduce(
    (arr, part, i) => {
      arr.push(DOMPurify.sanitize(part));
      const match = matches[i];
      if (match) {
        arr.push(
          <a
            key={i}
            href={matches[i]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {DOMPurify.sanitize(match)}
          </a>,
        );
      }
      return arr;
    },
    [] as (string | JSX.Element)[],
  );

  return <>{result}</>;
}
