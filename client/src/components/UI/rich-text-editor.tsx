import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Quote,
  Strikethrough,
  Underline
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className={cn('border rounded-md', className)}>
      <div className="border-b p-2 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('bold') ? 'bg-gray-200' : ''
              )}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('italic') ? 'bg-gray-200' : ''
              )}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('underline') ? 'bg-gray-200' : ''
              )}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('strike') ? 'bg-gray-200' : ''
              )}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
              )}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
              )}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
              )}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('bulletList') ? 'bg-gray-200' : ''
              )}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('orderedList') ? 'bg-gray-200' : ''
              )}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex gap-1 border-r pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
              )}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
              )}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
              )}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''
              )}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Code and Quote */}
          <div className="flex gap-1 border-r pr-2 mr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('code') ? 'bg-gray-200' : ''
              )}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={disabled}
              className={cn(
                'p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
                editor.isActive('blockquote') ? 'bg-gray-200' : ''
              )}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Links */}
          <div className="flex gap-1">
            {editor.isActive('link') ? (
              <button
                type="button"
                onClick={removeLink}
                disabled={disabled}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove Link"
              >
                <LinkIcon className="w-4 h-4 text-red-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={addLink}
                disabled={disabled}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 min-h-[120px]">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};

export default RichTextEditor; 