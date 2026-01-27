import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { theme } from '../styles/theme';
import { fetchBoardPreviews, parseBoardUrl } from '../services/pinterest.service';

interface MoodboardItem {
  id: string;
  type: 'image' | 'pinterest' | 'link';
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  previewImages?: string[];
  extractedThemes?: string[];
  extractedColors?: string[];
  extractionDate?: string;
}

export const MoodboardPage: React.FC = () => {
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [pinterestBoardUrl, setPinterestBoardUrl] = useState('');
  const [loadingBoard, setLoadingBoard] = useState(false);

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
    const parsed = parseBoardUrl(pinterestBoardUrl);
    if (!parsed) {
      alert('Please enter a valid Pinterest board URL');
      return;
    }

    setLoadingBoard(true);

    try {
      // Fetch preview images from the board
      const previewImages = await fetchBoardPreviews(pinterestBoardUrl, 6);
      
      const boardName = parsed.boardName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      const newItem: MoodboardItem = {
        id: Date.now().toString(),
        type: 'pinterest',
        url: pinterestBoardUrl,
        title: boardName || 'Pinterest Board',
        description: `Linked Pinterest board: ${pinterestBoardUrl}`,
        previewImages: previewImages.length > 0 ? previewImages : undefined,
      };

      saveItems([...items, newItem]);
      setPinterestBoardUrl('');
    } catch (error) {
      console.error('Error linking Pinterest board:', error);
      // Still save the board link even if previews fail
      const newItem: MoodboardItem = {
        id: Date.now().toString(),
        type: 'pinterest',
        url: pinterestBoardUrl,
        title: 'Pinterest Board',
        description: `Linked Pinterest board: ${pinterestBoardUrl}`,
      };
      saveItems([...items, newItem]);
      setPinterestBoardUrl('');
    } finally {
      setLoadingBoard(false);
    }
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
          />
          <Button onClick={handleLinkPinterest} disabled={!pinterestBoardUrl.trim() || loadingBoard}>
            {loadingBoard ? 'Loading...' : 'Link Board'}
          </Button>
        </div>
        <p
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Paste your Pinterest board URL to link it to your moodboard.
        </p>
      </Card>

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
                  {item.previewImages && item.previewImages.length > 0 ? (
                    <div
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        borderRadius: theme.borderRadius.md,
                        marginBottom: theme.spacing.sm,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: theme.spacing.xs,
                      }}
                    >
                      {item.previewImages.slice(0, 4).map((imageUrl, idx) => (
                        <img
                          key={idx}
                          src={imageUrl}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: theme.borderRadius.sm,
                            border: `1px solid ${theme.colors.border}`,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  ) : (
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
                        flexDirection: 'column',
                        gap: theme.spacing.xs,
                      }}
                    >
                      <span style={{ fontSize: '48px' }}>📌</span>
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.text.secondary,
                        }}
                      >
                        Preview unavailable
                      </span>
                    </div>
                  )}
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {item.title || 'Pinterest Board'}
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
                    View on Pinterest →
                  </a>
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
