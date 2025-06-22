useEffect(() => {
    if (!page) return;
    const canvas = canvasElement.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const renderTask = page.render({ canvasContext: ctx, viewport });

    renderTask.promise
      .then(() => {
        if (positionsInPage.length === 0) return;

        const pageHeightPDF = page.view[3] - page.view[1];
        const x1_marker = Math.min(...positionsInPage.map((p) => p[1]));
        const y1_marker = Math.min(...positionsInPage.map((p) => p[3]));
        const x3_marker = Math.max(...positionsInPage.map((p) => p[2]));
        const y3_marker = Math.max(...positionsInPage.map((p) => p[4]));

        const cornersCanvas = [
          [x1_marker, y1_marker],
          [x3_marker, y3_marker],
        ].map(([x, y]) =>
          viewport.convertToViewportPoint(x, pageHeightPDF - y),
        );

        const left = Math.min(...cornersCanvas.map((c) => c[0]));
        const right = Math.max(...cornersCanvas.map((c) => c[0]));
        const top = Math.min(...cornersCanvas.map((c) => c[1]));
        const bottom = Math.max(...cornersCanvas.map((c) => c[1]));
        const width = right - left;
        const height = bottom - top;

        ctx.fillStyle = "rgba(204, 255, 204, 0.2)";
        ctx.fillRect(left, top, width, height);
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 1;
        ctx.strokeRect(left, top, width, height);
      })
      .catch((err) => {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Lỗi khi render PDF:", err);
        }
      });

    return () => {
      renderTask.cancel();
    };
  }, [page, viewport, positionsInPage]);