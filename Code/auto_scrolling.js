export default function ScrollManager({
    pageRefs,
    filePath,
    numPages,
  }: {
    pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
    filePath: string;
    numPages: number;
  }) {
    const { chunkSelected } = useChunkContext();
    const hasScrolledRef = useRef<string | null>(null);
  
    useEffect(() => {
      hasScrolledRef.current = null;
    }, [chunkSelected?.id, filePath]);
  
    useEffect(() => {
      if (
        !chunkSelected ||
        chunkSelected.positions.length === 0 ||
        numPages === 0
      )
        return;
  
      const chunkKey = `${filePath}-${chunkSelected.id}`;
      if (hasScrolledRef.current === chunkKey) return;
  
      const pageNumber = chunkSelected.positions[0][0];
      if (pageNumber < 1 || pageNumber > numPages) return;
  
      const pageEl = pageRefs.current[pageNumber - 1];
      if (pageEl) {
        hasScrolledRef.current = chunkKey;
        pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, [chunkSelected, filePath, numPages, pageRefs]);
  
    return null;
  }