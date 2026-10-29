import { useEffect, useState } from 'react';
import { getAvatarUrl } from '../services/api';

/**
 * The account's profile photo as an image URL, or null without one. Fetched again whenever
 * the account says the photo changed (avatarUpdatedAt), on this site or in the app.
 */
export default function useAvatarUrl(account) {
  const updatedAt = account?.avatarUpdatedAt;
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!updatedAt) {
      setSrc(null);
      return undefined;
    }
    let url = null;
    let active = true;
    getAvatarUrl()
      .then((loaded) => {
        url = loaded;
        if (active) setSrc(loaded);
        else if (loaded) URL.revokeObjectURL(loaded);
      })
      .catch(() => active && setSrc(null));
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [updatedAt]);

  return src;
}
