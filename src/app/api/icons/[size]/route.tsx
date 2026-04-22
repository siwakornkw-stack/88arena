import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam, 10);
  if (isNaN(size) || size < 16 || size > 512) {
    return new Response('Invalid size', { status: 400 });
  }

  const fontSize = Math.round(size * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.2,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
        }}
      >
        🏟️
      </div>
    ),
    { width: size, height: size },
  );
}
