#!/usr/bin/env python3
# migrate_colors.py
# Migra todos los archivos de COLORS estático a useTheme() dinámico
# Uso: python3 migrate_colors.py

import os
import re

BASE = os.path.expanduser('~/Documents/publicando/PublicanDo/src')

FILES = [
    'config/toastConfig.tsx',
    'navigation/AppNavigator.tsx',
    'screens/ForgotPasswordScreen.tsx',
    'screens/LegalScreen.tsx',
    'screens/CreateAdvertisementScreen.tsx',
    'screens/CreateGuideScreen.tsx',
    'screens/GuideDetailScreen.tsx',
    'screens/MyAdvertisementsScreen.tsx',
    'screens/GuidesListScreen.tsx',
    'screens/FAQScreen.tsx',
    'screens/RegisterScreen.tsx',
    'screens/ProfileScreen.tsx',
    'screens/EditAdvertisementScreen.tsx',
    'screens/MyGuidesScreen.tsx',
    'screens/ReportsManagementScreen.tsx',
    'screens/AdminDashboardScreen.tsx',
    'screens/DetailScreen.tsx',
    'screens/UsersManagementScreen.tsx',
    'screens/HomeScreen.tsx',
    'screens/AdvertisementStatsScreen.tsx',
    'screens/EditGuideScreen.tsx',
    'screens/LoginScreen.tsx',
    'components/ReportModal.tsx',
    'components/LocationPicker.tsx',
    'components/RichTextViewer.tsx',
    'components/ScheduleForm.tsx',
    'components/ContactInfoOverlay.tsx',
    'components/NativeAdCard.tsx',
    'components/MediaCarouselSimple.tsx',
    'components/FullScreenFlyerModal.tsx',
    'components/MediaPicker.tsx',
    'components/RichTextEditor.tsx',
    'components/ContactInfoForm.tsx',
    'components/MediaCarousel.tsx',
    'components/PremiumExpiredBadge.tsx',
    'components/BanModal.tsx',
    'components/RejectModal.tsx',
]

# Archivos que NO son componentes funcionales React (no pueden usar hooks)
# toastConfig puede usar el tema pero de forma distinta
NON_COMPONENT_FILES = [
    'config/toastConfig.tsx',
    'navigation/AppNavigator.tsx',  # AppNavigator se maneja manualmente
]

OLD_IMPORT = "import { COLORS } from '../constants/colors';"
OLD_IMPORT_ALT = "import { COLORS } from '../../constants/colors';"

# Para screens (un nivel de profundidad)
NEW_IMPORT_SCREEN = "import { useTheme } from '../context/ThemeContext';"
# Para components (un nivel de profundidad, mismo nivel que screens)  
NEW_IMPORT_COMPONENT = "import { useTheme } from '../context/ThemeContext';"

HOOK_LINE = "  const { colors: COLORS } = useTheme();"

def is_component_file(filepath: str) -> bool:
    """Determina si el archivo es un componente React que puede usar hooks"""
    relative = filepath.replace(BASE + '/', '')
    return relative not in NON_COMPONENT_FILES

def get_import_line(filepath: str) -> str:
    """Retorna el import correcto según la ubicación del archivo"""
    return NEW_IMPORT_SCREEN  # Mismo nivel para screens y components

def migrate_file(relative_path: str):
    filepath = os.path.join(BASE, relative_path)
    
    if not os.path.exists(filepath):
        print(f"⚠️  No encontrado: {relative_path}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Verificar que usa COLORS
    if 'COLORS' not in content:
        print(f"⏭️  Sin COLORS: {relative_path}")
        return

    # Verificar que ya fue migrado
    if 'useTheme' in content:
        print(f"✅ Ya migrado: {relative_path}")
        return

    original = content

    # Archivos no-componente: solo reemplazar el import, sin agregar hook
    if not is_component_file(filepath):
        # Para AppNavigator lo hacemos manualmente
        print(f"⏭️  Manual: {relative_path}")
        return

    # ── 1. Reemplazar el import de COLORS ──────────────────────────────────────
    new_import = get_import_line(filepath)
    
    if OLD_IMPORT in content:
        content = content.replace(OLD_IMPORT, new_import)
    elif OLD_IMPORT_ALT in content:
        content = content.replace(OLD_IMPORT_ALT, new_import)
    else:
        # Buscar variante con llaves extra: { COLORS, getTheme } etc.
        content = re.sub(
            r"import \{ [^}]*COLORS[^}]* \} from '(?:\.\.\/)+constants/colors';",
            new_import,
            content
        )

    # ── 2. Agregar el hook dentro del componente ────────────────────────────────
    # Buscar el primer `const NombreComponente = (` o `const NombreComponente: React.FC`
    # y agregar el hook después de la primera línea de la función
    
    # Patrón: busca la apertura del componente funcional
    component_pattern = re.compile(
        r'(const \w+ ?[:=][^{]*\{)\n',
        re.MULTILINE
    )
    
    match = component_pattern.search(content)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + HOOK_LINE + '\n' + content[insert_pos:]
    else:
        print(f"⚠️  No se pudo encontrar componente en: {relative_path}")
        return

    if content == original:
        print(f"⏭️  Sin cambios: {relative_path}")
        return

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Migrado: {relative_path}")


def main():
    print("🚀 Iniciando migración de COLORS → useTheme()\n")
    
    migrated = 0
    skipped = 0
    
    for f in FILES:
        migrate_file(f)
    
    print(f"\n✅ Migración completada")
    print(f"📁 Archivos procesados: {len(FILES)}")
    print(f"\n⚠️  Archivos manuales pendientes:")
    print(f"   - src/navigation/AppNavigator.tsx")
    print(f"   - src/config/toastConfig.tsx")
    print(f"\n💡 Próximo paso: copiar ThemeContext.tsx y actualizar AppNavigator")


if __name__ == '__main__':
    main()
