const urlRegex =
  /(?:(?:https?|ftp):\/\/)(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s]*/gi;

export default function textLink(text: string): JSX.Element {
  const matches = text.match(urlRegex);

  matches?.forEach((match) => {
    text = text.replace(
      match,
      `<a class="underline" href='${match}' target="_blank">${match}</a>`,
    );
  });

  return <div dangerouslySetInnerHTML={{ __html: text }} />;
}
