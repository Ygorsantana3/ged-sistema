import React from 'react';

export default function FolderTree({ folders, selectedId, onSelect }) {
  const buildTree = (parentId = null, level = 0) => {
    return folders
      .filter(f => f.pasta_pai_id === parentId)
      .map(folder => (
        <div key={folder.id}>
          <div className={`tree-item ${level > 0 ? 'level-1' : ''} ${selectedId === folder.id ? 'active' : ''}`}
            onClick={() => onSelect(folder.id)} style={{ paddingLeft: 12 + level * 20 }}>
            📁 {folder.nome}
          </div>
          {buildTree(folder.id, level + 1)}
        </div>
      ));
  };

  return <div className="folder-tree">{buildTree()}</div>;
}
