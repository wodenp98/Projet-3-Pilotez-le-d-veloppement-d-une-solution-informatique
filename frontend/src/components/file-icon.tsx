import { File, FileAudio, FileImage, FileText, FileVideo } from "lucide-react";

export function FileIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  if (type.startsWith("image/")) return <FileImage className={className} />;
  if (type.startsWith("video/")) return <FileVideo className={className} />;
  if (type.startsWith("audio/")) return <FileAudio className={className} />;
  if (type.startsWith("text/") || type === "application/pdf")
    return <FileText className={className} />;
  return <File className={className} />;
}
