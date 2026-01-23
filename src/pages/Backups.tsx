import { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Info, 
  FileJson,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackup } from '@/hooks/useBackup';

export default function Backups() {
  const {
    stats,
    backupData,
    isGenerating,
    isImporting,
    fetchStats,
    generateBackup,
    downloadBackup,
    importBackup,
    clearBackupData,
  } = useBackup();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [exportAll, setExportAll] = useState(true);
  const [replaceAll, setReplaceAll] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Set default backup name with current date
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '_');
    setBackupName(`ZF_backup_${formattedDate}`);
  }, [showExportDialog]);

  const handleGenerateBackup = () => {
    setShowExportDialog(true);
  };

  const handleConfirmExport = async () => {
    await generateBackup(backupName);
    setShowExportDialog(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await importBackup(selectedFile, replaceAll);
    setSelectedFile(null);
    setReplaceAll(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const statItems = [
    { label: 'Funis criados', value: stats.funnels },
    { label: 'Etapas de funis', value: stats.funnelSteps },
    { label: 'Etiquetas criadas', value: stats.labels },
    { label: 'Gatilhos criados', value: stats.triggers },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Backups</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus backups e mantenha seus dados seguros
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <Card key={item.label} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-primary">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'import' ? 'outline' : 'ghost'}
            onClick={() => setActiveTab('import')}
            className={activeTab === 'import' ? 'border-primary text-primary' : ''}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar backup
          </Button>
          <Button
            variant={activeTab === 'export' ? 'outline' : 'ghost'}
            onClick={() => setActiveTab('export')}
            className={activeTab === 'export' ? 'border-primary text-primary' : ''}
          >
            <Download className="w-4 h-4 mr-2" />
            Gerar backup
          </Button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={handleGenerateBackup}
                disabled={isGenerating}
                className="w-64"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Gerar backup
              </Button>

              {backupData && (
                <Button
                  size="lg"
                  onClick={downloadBackup}
                  className="w-64 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fazer download
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* Replace All Toggle */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Ao importar um backup</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <Switch
                  id="replace-all"
                  checked={replaceAll}
                  onCheckedChange={setReplaceAll}
                />
                <Label htmlFor="replace-all" className="text-sm font-medium">
                  SUBSTITUIR TODOS OS ITENS EXISTENTES
                </Label>
              </div>
            </div>

            {replaceAll && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ATENÇÃO: Se a opção acima (SUBSTITUIR TODOS OS ITENS EXISTENTES) estiver habilitada, os seus dados atuais serão perdidos.
                </AlertDescription>
              </Alert>
            )}

            {/* File Drop Zone */}
            <div
              className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center transition-colors hover:border-primary/50"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <FileJson className="w-12 h-12 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">Formato aceito: .json</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Para inserir um backup, clique aqui ou arraste o arquivo para esta área.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Formatos aceitos: <span className="text-primary">.json</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ position: 'absolute' }}
                  />
                </>
              )}
            </div>

            {/* Hidden file input for click selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-48"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Importar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-primary">Informação</p>
                <p className="text-sm text-muted-foreground">
                  Aqui você pode exportar um backup de todos os seus dados. É importante que você faça backups regularmente para que você não perca suas configurações e dados.
                </p>
                <p className="text-sm text-muted-foreground">
                  O ZapFlow não armazena seus dados de forma permanente, portanto em caso de perda de dados, não será possível recuperá-los.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Confirmação de exportação
            </DialogTitle>
            <DialogDescription>
              Configure as opções do seu backup antes de exportar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-name">Nome do backup</Label>
              <Input
                id="backup-name"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Ex: ZF_backup_23_01_2026"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="export-all"
                checked={exportAll}
                onCheckedChange={setExportAll}
              />
              <div>
                <Label htmlFor="export-all" className="font-medium">
                  Exportar tudo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Exportar todos os itens. Desativando essa opção você pode selecionar quais itens serão exportados.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmExport} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exportar backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
