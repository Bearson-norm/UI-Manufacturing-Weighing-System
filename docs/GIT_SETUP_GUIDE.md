# Panduan Setup Git Repository dan GitHub Actions

Panduan lengkap untuk setup repository Git baru, pindah branch, dan konfigurasi GitHub Actions.

## 📋 Daftar Isi

1. [Attach Repository Git Baru](#1-attach-repository-git-baru)
2. [Pindah Branch](#2-pindah-branch)
3. [Setup GitHub Actions](#3-setup-github-actions)

---

## 1. Attach Repository Git Baru

### Opsi A: Repository Baru (Belum Ada Git)

Jika folder Anda belum memiliki Git repository:

```bash
# 1. Inisialisasi Git repository
git init

# 2. Tambahkan semua file ke staging
git add .

# 3. Commit pertama
git commit -m "Initial commit: Manufacturing Dashboard"

# 4. Buat branch KMI-Production
git checkout -b KMI-Production

# 5. Tambahkan remote repository (ganti URL dengan repository Anda)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 6. Push ke remote repository
git push -u origin KMI-Production
```

### Opsi B: Repository Sudah Ada (Attach ke Remote Baru)

Jika folder sudah memiliki Git repository:

```bash
# 1. Cek remote yang ada
git remote -v

# 2. Hapus remote lama (jika ada)
git remote remove origin

# 3. Tambahkan remote baru
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 4. Verifikasi remote
git remote -v

# 5. Push ke remote baru
git push -u origin KMI-Production
```

### Opsi C: Clone Repository yang Sudah Ada

Jika repository sudah ada di GitHub:

```bash
# 1. Clone repository
git clone https://github.com/USERNAME/REPO_NAME.git

# 2. Masuk ke folder
cd REPO_NAME

# 3. Cek branch yang ada
git branch -a

# 4. Buat atau checkout branch KMI-Production
git checkout -b KMI-Production
# atau jika branch sudah ada:
# git checkout KMI-Production
```

---

## 2. Pindah Branch

### Membuat Branch Baru

```bash
# Buat branch baru dari branch saat ini
git checkout -b KMI-Production

# Atau buat branch baru dari branch tertentu
git checkout -b KMI-Production main
```

### Pindah ke Branch yang Sudah Ada

```bash
# Pindah ke branch KMI-Production
git checkout KMI-Production

# Atau menggunakan switch (Git 2.23+)
git switch KMI-Production
```

### Push Branch ke Remote

```bash
# Push branch ke remote untuk pertama kali
git push -u origin KMI-Production

# Push perubahan selanjutnya
git push
```

### Melihat Semua Branch

```bash
# Lihat branch lokal
git branch

# Lihat semua branch (termasuk remote)
git branch -a

# Lihat branch remote
git branch -r
```

---

## 3. Setup GitHub Actions

### Langkah 1: Pastikan File Workflow Sudah Ada

File workflow sudah ada di: `.github/workflows/deploy-production.yml`

Jika belum ada, buat folder:
```bash
mkdir -p .github/workflows
```

### Langkah 2: Verifikasi Workflow File

Pastikan file `.github/workflows/deploy-production.yml` sudah ada dan berisi konfigurasi yang benar.

### Langkah 3: Commit dan Push Workflow File

```bash
# 1. Tambahkan file workflow ke Git
git add .github/workflows/deploy-production.yml

# 2. Commit perubahan
git commit -m "Add GitHub Actions workflow for KMI-Production branch"

# 3. Push ke remote
git push origin KMI-Production
```

### Langkah 4: Verifikasi di GitHub

1. Buka repository di GitHub
2. Klik tab **Actions**
3. Workflow akan otomatis berjalan saat push ke branch `KMI-Production`
4. Atau klik **Run workflow** untuk trigger manual

### Langkah 5: Setup GitHub Secrets

#### Database Secrets (Default: admin/admin123)
Workflow menggunakan default values:
- `DB_USER`: admin
- `DB_PASSWORD`: admin123
- `DB_HOST`: localhost (untuk CI/CD)
- `DB_NAME`: kmi_manufacturing_db

Jika ingin override, tambahkan secrets:
1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut (opsional):
   - `DB_HOST` - Database host
   - `DB_PORT` - Database port
   - `DB_NAME` - Database name
   - `DB_USER` - Database user (default: admin)
   - `DB_PASSWORD` - Database password (default: admin123)

#### VPS Deployment Secrets (Wajib untuk deployment ke VPS)
Untuk deployment ke VPS, tambahkan secrets berikut:
- `VPS_HOST` - IP atau domain VPS (wajib)
- `VPS_USER` - SSH user (default: root)
- `VPS_PORT` - SSH port (default: 22)
- `VPS_DEPLOY_PATH` - Path deployment (default: /var/www/manufacturing-dashboard)
- `VPS_SSH_KEY` - Private SSH key untuk akses VPS (wajib)

Lihat dokumentasi lengkap di: `docs/VPS_DEPLOYMENT_SETUP.md`

---

## 🔧 Troubleshooting

### Error: Remote Already Exists

```bash
# Hapus remote yang ada
git remote remove origin

# Tambahkan remote baru
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

### Error: Branch Already Exists

```bash
# Pindah ke branch yang sudah ada
git checkout KMI-Production

# Atau rename branch yang ada
git branch -m OLD_NAME KMI-Production
```

### Error: Workflow Tidak Berjalan

1. Pastikan file ada di `.github/workflows/deploy-production.yml`
2. Pastikan file sudah di-commit dan di-push
3. Cek syntax YAML di workflow file
4. Pastikan branch name sesuai dengan trigger di workflow (`KMI-Production`)

### Error: Permission Denied

```bash
# Setup Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Atau gunakan SSH key
# Generate SSH key: ssh-keygen -t ed25519 -C "your.email@example.com"
# Tambahkan ke GitHub: Settings → SSH and GPG keys
```

---

## 📝 Checklist Setup

- [ ] Git repository sudah diinisialisasi atau di-clone
- [ ] Remote repository sudah ditambahkan
- [ ] Branch `KMI-Production` sudah dibuat atau di-checkout
- [ ] File workflow `.github/workflows/deploy-production.yml` sudah ada
- [ ] File workflow sudah di-commit dan di-push
- [ ] Workflow berjalan di GitHub Actions tab
- [ ] Database migration berhasil dijalankan
- [ ] Build frontend berhasil
- [ ] Health check endpoint berhasil

---

## 🚀 Quick Start Script

Untuk memudahkan, berikut script lengkap untuk setup:

```bash
#!/bin/bash
# Setup Git Repository dan GitHub Actions

# 1. Inisialisasi Git (jika belum ada)
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Manufacturing Dashboard"
fi

# 2. Buat branch KMI-Production
echo "Creating KMI-Production branch..."
git checkout -b KMI-Production 2>/dev/null || git checkout KMI-Production

# 3. Setup remote (ganti URL dengan repository Anda)
read -p "Enter GitHub repository URL: " REPO_URL
git remote remove origin 2>/dev/null
git remote add origin $REPO_URL

# 4. Push ke remote
echo "Pushing to remote repository..."
git push -u origin KMI-Production

# 5. Verifikasi
echo "Setup complete!"
echo "Repository: $REPO_URL"
echo "Branch: KMI-Production"
echo "Workflow: .github/workflows/deploy-production.yml"
```

Simpan sebagai `setup-git.sh` dan jalankan:
```bash
chmod +x setup-git.sh
./setup-git.sh
```

---

## 📚 Referensi

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Git Branching](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)

---

**Catatan**: Pastikan Anda memiliki akses ke repository GitHub sebelum menjalankan perintah push.
