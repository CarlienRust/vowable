import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { extractThemesFromBoard } from '../services/pinterest.service';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { theme } from '../styles/theme';

interface MoodboardItem {
  id: string;
  type: 'image' | 'pinterest' | 'link';
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  extractedThemes?: string[];
  extractedColors?: string[];
  extractionDate?: string;
}

export const MoodboardPage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const setWedding = useWeddingPlanStore((state) => state.setWedding);
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [pinterestBoardUrl, setPinterestBoardUrl] = useState('');
  const [extractingThemes, setExtractingThemes] = useState(false);
  const [extractedThemes, setExtractedThemes] = useState<{
    themes: string[];
    colors: string[];
    keywords: string[];
  } | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  useEffect(() => {
    // Load moodboard items from localStorage
    const saved = localStorage.getItem('moodboard_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load moodboard items', e);
      }
    }
  }, []);

  const saveItems = (newItems: MoodboardItem[]) => {
    setItems(newItems);
    localStorage.setItem('moodboard_items', JSON.stringify(newItems));
  };

  const handleAddImage = () => {
    if (!newItemUrl.trim()) return;

    const newItem: MoodboardItem = {
      id: Date.now().toString(),
      type: 'image',
      url: newItemUrl,
      title: newItemTitle || undefined,
      thumbnail: newItemUrl,
    };

    saveItems([...items, newItem]);
    setNewItemUrl('');
    setNewItemTitle('');
    setShowAddForm(false);
  };

  const handleAddLink = () => {
    if (!newItemUrl.trim()) return;

    const newItem: MoodboardItem = {
      id: Date.now().toString(),
      type: 'link',
      url: newItemUrl,
      title: newItemTitle || newItemUrl,
    };

    saveItems([...items, newItem]);
    setNewItemUrl('');
    setNewItemTitle('');
    setShowAddForm(false);
  };

  const handleLinkPinterest = async () => {
    if (!pinterestBoardUrl.trim()) return;

    // Validate URL
    const boardMatch = pinterestBoardUrl.match(/pinterest\.com\/[^\/]+\/([^\/]+)/);
    if (!boardMatch) {
      alert('Please enter a valid Pinterest board URL');
      return;
    }

    setExtractingThemes(true);
    try {
      // Extract themes from board
      const extraction = await extractThemesFromBoard(pinterestBoardUrl);
      setExtractedThemes(extraction);
      setSelectedThemes(extraction.keywords.slice(0, 10)); // Pre-select first 10 keywords
    } catch (error) {
      console.error('Failed to extract themes', error);
      // Still create the item even if extraction fails
      const newItem: MoodboardItem = {
        id: Date.now().toString(),
        type: 'pinterest',
        url: pinterestBoardUrl,
        title: 'Pinterest Board',
        description: `Linked Pinterest board: ${pinterestBoardUrl}`,
      };
      saveItems([...items, newItem]);
      setPinterestBoardUrl('');
      setExtractingThemes(false);
      alert('Board linked, but theme extraction failed. You can add themes manually.');
      return;
    }
    setExtractingThemes(false);
  };

  const handleConfirmThemes = () => {
    if (!pinterestBoardUrl.trim() || !extractedThemes) return;

    const newItem: MoodboardItem = {
      id: Date.now().toString(),
      type: 'pinterest',
      url: pinterestBoardUrl,
      title: 'Pinterest Board',
      description: `Linked Pinterest board: ${pinterestBoardUrl}`,
      extractedThemes: selectedThemes,
      extractedColors: extractedThemes.colors,
      extractionDate: new Date().toISOString(),
    };

    saveItems([...items, newItem]);
    setPinterestBoardUrl('');
    setExtractedThemes(null);
    setSelectedThemes([]);
  };

  const handleCancelThemeExtraction = () => {
    // Still save the board without extracted themes
    if (pinterestBoardUrl.trim()) {
      const newItem: MoodboardItem = {
        id: Date.now().toString(),
        type: 'pinterest',
        url: pinterestBoardUrl,
        title: 'Pinterest Board',
        description: `Linked Pinterest board: ${pinterestBoardUrl}`,
      };
      saveItems([...items, newItem]);
      setPinterestBoardUrl('');
    }
    setExtractedThemes(null);
    setSelectedThemes([]);
  };

  const handleToggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== theme));
    } else {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  const handleApplyThemesToWedding = () => {
    if (!wedding || selectedThemes.length === 0) return;

    const updatedWedding = {
      ...wedding,
      themeTags: [...(wedding.themeTags || []), ...selectedThemes].slice(0, 10), // Limit to 10 tags
    };
    setWedding(updatedWedding);
    alert('Themes applied to your wedding plan!');
  };

  const handleRemoveItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        minHeight: 'calc(100vh - 180px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl,
        }}
      >
        <h1
          style={{
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}
        >
          Moodboard
        </h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {showAddForm && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Add to Moodboard
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Input
              label="Image URL or Link"
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              label="Title (optional)"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="e.g. Rustic centerpiece inspiration"
            />
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button onClick={handleAddImage} style={{ flex: 1 }}>
                Add Image
              </Button>
              <Button onClick={handleAddLink} variant="outline" style={{ flex: 1 }}>
                Add Link
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <h2
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            marginBottom: theme.spacing.md,
          }}
        >
          Link Pinterest Board
        </h2>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <Input
            value={pinterestBoardUrl}
            onChange={(e) => setPinterestBoardUrl(e.target.value)}
            placeholder="https://pinterest.com/username/board-name"
            style={{ flex: 1 }}
            disabled={extractingThemes}
          />
          <Button onClick={handleLinkPinterest} disabled={extractingThemes || !pinterestBoardUrl.trim()}>
            {extractingThemes ? 'Extracting...' : 'Link Board'}
          </Button>
        </div>
        <p
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Paste your Pinterest board URL to link it to your moodboard. We'll extract theme keywords to help match vendors.
        </p>
      </Card>

      {extractedThemes && (
        <Card style={{ marginBottom: theme.spacing.lg, border: `2px solid ${theme.colors.accent.primary}` }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Extracted Themes from Pinterest Board
          </h2>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.md,
            }}
          >
            Select the themes you'd like to use for vendor matching:
          </p>

          {extractedThemes.themes.length > 0 && (
            <div style={{ marginBottom: theme.spacing.md }}>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: theme.spacing.xs,
                }}
              >
                Theme Keywords:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                {extractedThemes.themes.map((themeKeyword) => (
                  <button
                    key={themeKeyword}
                    type="button"
                    onClick={() => handleToggleTheme(themeKeyword)}
                    style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${
                        selectedThemes.includes(themeKeyword)
                          ? theme.colors.accent.primary
                          : theme.colors.border
                      }`,
                      backgroundColor: selectedThemes.includes(themeKeyword)
                        ? theme.colors.accent.light
                        : theme.colors.surface,
                      color: selectedThemes.includes(themeKeyword)
                        ? theme.colors.accent.primary
                        : theme.colors.text.primary,
                      cursor: 'pointer',
                      fontSize: theme.typography.fontSize.xs,
                    }}
                  >
                    {themeKeyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {extractedThemes.colors.length > 0 && (
            <div style={{ marginBottom: theme.spacing.md }}>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: theme.spacing.xs,
                }}
              >
                Colors:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                {extractedThemes.colors.map((color) => (
                  <Tag key={color} variant="outline">
                    {color}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <Button onClick={handleConfirmThemes} style={{ flex: 1 }}>
              Save Board with Themes ({selectedThemes.length} selected)
            </Button>
            {wedding && (
              <Button onClick={handleApplyThemesToWedding} variant="outline">
                Apply to Wedding Plan
              </Button>
            )}
            <Button onClick={handleCancelThemeExtraction} variant="outline">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <Card>
          <p
            style={{
              textAlign: 'center',
              color: theme.colors.text.secondary,
              padding: theme.spacing.xl,
            }}
          >
            Your moodboard is empty. Add images, links, or link a Pinterest board to get started!
          </p>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: theme.spacing.md,
          }}
        >
          {items.map((item) => (
            <Card key={item.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleRemoveItem(item.id)}
                style={{
                  position: 'absolute',
                  top: theme.spacing.xs,
                  right: theme.spacing.xs,
                  background: theme.colors.error || '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  zIndex: 10,
                }}
              >
                ×
              </button>
              {item.type === 'image' && item.thumbnail ? (
                <div>
                  <img
                    src={item.thumbnail}
                    alt={item.title || 'Moodboard image'}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.sm,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {item.title && (
                    <h3
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      {item.title}
                    </h3>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.accent.primary,
                      textDecoration: 'none',
                    }}
                  >
                    View source →
                  </a>
                </div>
              ) : item.type === 'pinterest' ? (
                <div>
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <span style={{ fontSize: '48px' }}>📌</span>
                  </div>
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Pinterest Board
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.accent.primary,
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      marginBottom: theme.spacing.xs,
                      display: 'block',
                    }}
                  >
                    {item.url}
                  </a>
                  {item.extractedThemes && item.extractedThemes.length > 0 && (
                    <div style={{ marginTop: theme.spacing.xs }}>
                      <p
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.medium,
                          color: theme.colors.text.secondary,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        Extracted themes:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                        {item.extractedThemes.slice(0, 5).map((themeKeyword) => (
                          <Tag key={themeKeyword} variant="outline" style={{ fontSize: '10px' }}>
                            {themeKeyword}
                          </Tag>
                        ))}
                        {item.extractedThemes.length > 5 && (
                          <Tag variant="outline" style={{ fontSize: '10px' }}>
                            +{item.extractedThemes.length - 5} more
                          </Tag>
                        )}
                      </div>
                    </div>
                  )}
                  {item.extractionDate && (
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                        marginTop: theme.spacing.xs,
                        fontStyle: 'italic',
                      }}
                    >
                      Extracted {new Date(item.extractionDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <span style={{ fontSize: '48px' }}>🔗</span>
                  </div>
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {item.title}
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.accent.primary,
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.url}
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
