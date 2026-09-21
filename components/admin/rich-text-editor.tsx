"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

export function RichTextEditor({ label, value, onChange, uploadImage }: { label: string; value: string; onChange: (html: string) => void; uploadImage?: (file: File) => Promise<string> }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const uploadImageRef = useRef(uploadImage);

  useEffect(() => {
    onChangeRef.current = onChange;
    uploadImageRef.current = uploadImage;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let editorElement: HTMLDivElement | null = null;
    (async () => {
      const { default: Quill } = await import("quill");
      if (cancelled || !host.isConnected) return;
      editorElement = document.createElement("div");
      host.appendChild(editorElement);
      const quill = new Quill(editorElement, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ header: [2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "link", "image"],
              ["clean"],
            ],
            handlers: {
              image: () => {
                const uploader = uploadImageRef.current;
                if (!uploader) {
                  window.alert("Image upload requires PocketBase. Switch to PocketBase mode or paste an image URL instead.");
                  return;
                }
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  uploader(file)
                    .then((url) => {
                      const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
                      quill.insertEmbed(range.index, "image", url, "user");
                      quill.setSelection(range.index + 1, 0, "silent");
                    })
                    .catch((error: unknown) => {
                      window.alert(error instanceof Error ? error.message : "Image upload failed");
                    });
                };
                input.click();
              },
            },
          },
        },
      });
      if (initialValueRef.current) quill.clipboard.dangerouslyPasteHTML(initialValueRef.current, "silent");
      quill.on("text-change", () => {
        const html = quill.getSemanticHTML();
        onChangeRef.current(html === "<p><br></p>" ? "" : html);
      });
    })();
    return () => {
      cancelled = true;
      if (editorElement && editorElement.parentNode === host) host.removeChild(editorElement);
    };
  }, []);

  return <div className="admin-field admin-richtext">
    <span className="admin-upload-label">{label}</span>
    <div ref={hostRef} className="admin-quill" />
  </div>;
}
