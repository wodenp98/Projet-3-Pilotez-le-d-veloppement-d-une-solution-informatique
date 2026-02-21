export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getExpirationDays(expiredAt: string): number {
  const now = new Date();
  const expDate = new Date(expiredAt);
  const diffMs = expDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatExpiresLabel(expiredAt: string): string {
  const diffDays = getExpirationDays(expiredAt);
  if (diffDays <= 0) return "Expiré";
  if (diffDays === 1) return "Expire demain";
  return `Expire dans ${diffDays} jours`;
}

export function formatExpirationDays(days: number): string {
  if (days <= 0)
    return "Ce fichier n'est plus disponible en téléchargement car il a expiré.";
  if (days === 1) return "Ce fichier expirera demain.";
  return `Ce fichier expirera dans ${days} jours.`;
}

export function formatExpiration(expirationDays: number): string {
  if (expirationDays === 1) return "une journée";
  if (expirationDays === 7) return "une semaine";
  return `${expirationDays} jours`;
}

export function getShareLink(token: string): string {
  return `${window.location.origin}/download/${token}`;
}
