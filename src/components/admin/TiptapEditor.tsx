'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  EditorContent,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  imageGallery?: {
    images: { url: string; name: string }[];
    onSelect: (url: string) => void;
    onUpload: (file: File) => Promise<string>;
  };
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Write your essay here...',
  imageGallery,
}: TiptapEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const extensions = useCallback(() => [
    StarterKit.configure({
      document: {
        paragraph: {
          className: 'prose prose-lg max-w-none',
        },
      },
    }),
    Image.extend({
      addAttributes() {
        return {
          alt: {
            default: null,
            parseHTML: (element) => element.getAttribute('alt'),
          },
          title: {
            default: null,
            parseHTML: (element) => element.getAttribute('title'),
          },
        };
      },
    }),
    Link.extend({
      openOnClick: false,
    }),
  ], []);

  const handleUpdate = useCallback(
    ({ editor }: { editor: any }) => {
      onChange(editor.getHTML());
    },
    [onChange]
  );

  useEffect(() => {
    const newEditor = useEditor?.({
      extensions: extensions(),
      content,
      editable: true,
      onUpdate: handleUpdate,
      editorProps: {
        attributes: {
          class:
            'prose prose-lg max-w-none focus:outline-none min-h-[400px]',
        },
      },
    });
    setEditor(newEditor);
    return () => {
      newEditor?.destroy();
    };
  }, [content, extensions, handleUpdate]);

  const handleImageInsert = useCallback(async (file: File) => {
    if (!imageGallery) return;
    try {
      const url = await imageGallery.onUpload(file);
      editor?.commands.setImage({ src: url, alt: file.name });
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image. Please try again.');
    }
  }, [editor, imageGallery]);

  const handleSelectExisting = useCallback((url: string) => {
    editor?.commands.setImage({ src: url, alt: url.split('/').pop() ?? 'Image' });
    setIsImageModalOpen(false);
  }, [editor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => editor?.commands.toggleBold()}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => editor?.commands.toggleItalic()}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => editor?.commands.toggleHeading({ level: 2 })}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Heading 2"
          >
            <span className="font-heading font-bold text-lg">H2</span>
          </button>
          <button
            onClick={() => editor?.commands.toggleHeading({ level: 3 })}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Heading 3"
          >
            <span className="font-heading font-bold text-lg">H3</span>
          </button>
          <button
            onClick={() => editor?.commands.toggleBulletList()}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Bullet List"
          >
            <span className="font-tech">•</span>
          </button>
          <button
            onClick={() => editor?.commands.toggleOrderedList()}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Ordered List"
          >
            <span className="font-tech">1.</span>
          </button>
          <button
            onClick={() => {
              setIsImageModalOpen(true);
            }}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const url = window.prompt('Enter link URL');
              if (url) editor?.commands.setLink({ href: url });
            }}
            className="p-2 rounded hover:bg-surface/50 text-text"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-muted font-tech">
          {editor ? editor.getHTML().length : 0} characters
        </span>
      </div>

      <EditorContent editor={editor} />

      {imageGallery && isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-text">Insert Image</h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-2 rounded hover:bg-surface/50 text-text"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-grow border border-border rounded-lg p-3">
                <p className="text-sm text-muted mb-2">Upload new image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageInsert(file);
                    e.target.value = '';
                  }}
                  className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-accent file:text-surface hover:file:bg-accent-hover"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2">
              <p className="text-sm text-muted font-tech mb-2">Select existing image</p>
              <div className="grid grid-cols-3 gap-2">
                {imageGallery.images.map((img) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt={img.name}
                    className="w-full h-24 object-cover rounded cursor-pointer hover:border-accent border-2 border-transparent"
                    onClick={() => handleSelectExisting(img.url)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
