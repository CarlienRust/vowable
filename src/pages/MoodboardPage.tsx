import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { theme } from '../styles/theme';
import shoeBg from '../assets/backgrounds/shoe.png';
import { fetchBoardPreviews, parseBoardUrl } from '../services/pinterest.service';
import { moodboardService, MoodboardItem } from '../services/moodboard.service';
import { authService } from '../services/auth.service';

const MOODBOARD_LOCAL_KEY = 'moodboard_items';

/** Default moodboard shown until the user adds or links their own. Vowable Pinterest board. */
const DEFAULT_MOODBOARD_PINTEREST_URL =
  'https://za.pinterest.com/carlienrust/vowable/?request_params=%7B%221%22%3A%20130%2C%20%227%22%3A%204705014969931794954%2C%20%228%22%3A%20316448380007027528%2C%20%2230%22%3A%20%22Vowable%22%2C%20%2232%22%3A%2045%2C%20%2233%22%3A%20%5B316448311347194925%2C%20316448311347194924%2C%20316448311347194742%2C%20316448311347194737%2C%20316448311347194724%2C%20316448311347194654%2C%20316448311347194653%2C%20316448311347194648%2C%20316448311347186323%2C%20316448311347186319%2C%20316448311347186318%2C%20316448311347186315%2C%20316448311347185520%2C%20316448311347185518%2C%20316448311347185517%2C%20316448311347185513%5D%2C%20%2236%22%3A%20%5B316448380007027528%5D%2C%20%2237%22%3A%20%22Vowable%22%2C%20%2234%22%3A%200%2C%20%22102%22%3A%204%7D&full_feed_title=Vowable&view_parameter_type=3069&pins_display=3';

export const MoodboardPage: React.FC = () => {
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [pinterestBoardUrl, setPinterestBoardUrl] = useState('');
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [defaultBoardPreviews, setDefaultBoardPreviews] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>('Pinterest preview');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_MOODBOARD_PINTEREST_URL);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const user = await authService.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const fromSupabase = await moodboardService.getMoodboardItems(user.id);
      if (cancelled) return;

      if (fromSupabase.length > 0) {
        setItems(fromSupabase);
        setLoading(false);
        return;
      }

      const raw = localStorage.getItem(MOODBOARD_LOCAL_KEY);
      if (raw) {
        try {
          const local: MoodboardItem[] = JSON.parse(raw);
          if (local.length > 0) {
            for (const it of local) {
              const { id: _id, ...rest } = it;
              await moodboardService.addMoodboardItem(user.id, rest);
            }
            localStorage.removeItem(MOODBOARD_LOCAL_KEY);
            const merged = await moodboardService.getMoodboardItems(user.id);
            if (!cancelled) setItems(merged);
          }
        } catch (e) {
          console.error('Failed to migrate moodboard from localStorage', e);
        }
      }

      if (!cancelled) {
        setItems(fromSupabase.length > 0 ? fromSupabase : []);
      }
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Load preview images for default Vowable board when moodboard is empty
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    fetchBoardPreviews(DEFAULT_MOODBOARD_PINTEREST_URL, 6).then((urls) => {
      if (!cancelled) setDefaultBoardPreviews(urls);
    });
    return () => { cancelled = true; };
  }, [loading]);

  const openPreview = (title: string, url: string, images?: string[]) => {
    setPreviewTitle(title);
    setPreviewUrl(url);
    setPreviewImages(images ?? []);
    setPreviewOpen(true);
  };

  const persistItem = async (item: Omit<MoodboardItem, 'id'>) => {
    const user = await authService.getUser();
    if (!user) return null;
    const id = await moodboardService.addMoodboardItem(user.id, item);
    if (id) {
      setItems((prev) => [...prev, { ...item, id }]);
      return id;
    }
    return null;
  };

  const removeItem = async (id: string) => {
    const ok = await moodboardService.removeMoodboardItem(id);
    if (ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddImage = async () => {
    if (!newItemUrl.trim()) return;

    const newItem: Omit<MoodboardItem, 'id'> = {
      type: 'image',
      url: newItemUrl,
      title: newItemTitle || undefined,
      thumbnail: newItemUrl,
    };

    const id = await persistItem(newItem);
    if (id) {
      setNewItemUrl('');
      setNewItemTitle('');
      setShowAddForm(false);
    }
  };

  const handleAddLink = async () => {
    if (!newItemUrl.trim()) return;

    const newItem: Omit<MoodboardItem, 'id'> = {
      type: 'link',
      url: newItemUrl,
      title: newItemTitle || newItemUrl,
    };

    const id = await persistItem(newItem);
    if (id) {
      setNewItemUrl('');
      setNewItemTitle('');
      setShowAddForm(false);
    }
  };

  const handleLinkPinterest = async () => {
    if (!pinterestBoardUrl.trim()) return;

    const parsed = parseBoardUrl(pinterestBoardUrl);
    if (!parsed) {
      alert('Please enter a valid Pinterest board URL');
      return;
    }

    setLoadingBoard(true);

    try {
      const previewImages = await fetchBoardPreviews(pinterestBoardUrl, 6);
      const boardName = parsed.boardName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const newItem: Omit<MoodboardItem, 'id'> = {
        type: 'pinterest',
        url: pinterestBoardUrl,
        title: boardName || 'Pinterest Board',
        description: `Linked Pinterest board: ${pinterestBoardUrl}`,
        previewImages: previewImages.length > 0 ? previewImages : undefined,
      };

      const id = await persistItem(newItem);
      if (id) setPinterestBoardUrl('');
    } catch (error) {
      console.error('Error linking Pinterest board:', error);
      const newItem: Omit<MoodboardItem, 'id'> = {
        type: 'pinterest',
        url: pinterestBoardUrl,
        title: 'Pinterest Board',
        description: `Linked Pinterest board: ${pinterestBoardUrl}`,
      };
      const id = await persistItem(newItem);
      if (id) setPinterestBoardUrl('');
    } finally {
      setLoadingBoard(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background,
          backgroundImage: `linear-gradient(rgba(250,250,250,0.2), rgba(250,250,250,0.2)), url(${shoeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: 'calc(100vh - 180px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: theme.colors.text.secondary }}>Loading moodboard…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        backgroundImage: `linear-gradient(rgba(250,250,250,0.2), rgba(250,250,250,0.2)), url(${shoeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
          Paste your Pinterest board URL to link it to your moodboard. You can link multiple boards.
        </p>
      </Card>

      <div style={{ marginBottom: theme.spacing.lg }}>
        <h2
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            marginBottom: theme.spacing.md,
          }}
        >
          Suggested
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: theme.spacing.md,
          }}
        >
          <Card style={{ position: 'relative' }}>
            <div>
              {defaultBoardPreviews.length > 0 ? (
                <div style={{ position: 'relative', marginBottom: theme.spacing.sm }}>
                  <img
                    src={defaultBoardPreviews[0]}
                    alt="Vowable Pinterest cover"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: theme.spacing.sm,
                      left: theme.spacing.sm,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: theme.borderRadius.full,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    Pinterest
                  </div>
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
                Vowable
              </h3>
              <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview('Vowable (Pinterest)', DEFAULT_MOODBOARD_PINTEREST_URL, defaultBoardPreviews)}
                  disabled={defaultBoardPreviews.length === 0}
                >
                  Preview
                </Button>
                <a
                  href={DEFAULT_MOODBOARD_PINTEREST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.accent.primary,
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    display: 'block',
                  }}
                >
                  View on Pinterest →
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>

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
                    <div style={{ position: 'relative', marginBottom: theme.spacing.sm }}>
                      <img
                        src={item.previewImages[0]}
                        alt={item.title || 'Pinterest Board'}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: theme.borderRadius.md,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: theme.spacing.sm,
                          left: theme.spacing.sm,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: theme.borderRadius.full,
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                      >
                        Pinterest
                      </div>
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
                  <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPreview(item.title || 'Pinterest Board', item.url, item.previewImages)}
                      disabled={!item.previewImages || item.previewImages.length === 0}
                    >
                      Preview
                    </Button>
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

      <Modal
        open={previewOpen}
        title={previewTitle}
        onClose={() => setPreviewOpen(false)}
        maxWidth="900px"
      >
        <p
          style={{
            marginTop: 0,
            marginBottom: theme.spacing.md,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Preview images (stored). For full board details, open Pinterest.
        </p>

        {previewImages.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.md,
            }}
          >
            {previewImages.slice(0, 12).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Preview ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
          </div>
        ) : (
          <Card style={{ backgroundColor: theme.colors.background }}>
            <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
              No stored preview images available for this board.
            </p>
          </Card>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.accent.primary,
              textDecoration: 'none',
            }}
          >
            Open in Pinterest →
          </a>
        </div>
      </Modal>
    </div>
  );
};
