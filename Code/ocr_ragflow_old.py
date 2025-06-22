model_dir = snapshot_download(
    repo_id="InfiniFlow/deepdoc",
    local_dir=os.path.join(get_project_base_directory(), "rag/res/deepdoc"),
    local_dir_use_symlinks=False
)
self.text_detector.append(TextDetector(model_dir, device_id))
self.text_recognizer.append(TextRecognizer(model_dir, device_id))