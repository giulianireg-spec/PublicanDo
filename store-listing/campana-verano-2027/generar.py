# Genera las piezas de la campaña de verano 2027 (HTML → PNG con Chrome sin interfaz).
# Uso: python3 generar.py   (necesita Google Chrome instalado)
import subprocess, pathlib
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
CSS = """
html,body{margin:0;overflow:hidden;font-family:-apple-system,"SF Pro Display","Helvetica Neue",Arial,sans-serif}
.brand{display:flex;align-items:center;gap:16px}.brand img{width:76px;height:76px;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.3)}
.brand b{font-size:46px;font-weight:900;letter-spacing:-1px}
.stamp{display:inline-flex;align-items:center;gap:10px;background:#0A0A0A;color:#A3E635;border:4px solid #A3E635;border-radius:999px;padding:10px 24px;font-weight:800;font-size:28px}
"""
FESTS = [
  ('cosquin', 'Festival de Cosquín', 'Cosquín, Córdoba · enero 2027', 'https://res.cloudinary.com/dwaouzfle/image/upload/c_fill,w_1080,h_700,q_auto/v1792643347/guiando/bz0dysimpsk1rzc4pk7p.jpg', 'Foto: CyberPen (CC BY-SA 4.0), vía Wikimedia Commons'),
  ('jesus-maria', 'Festival de Doma y Folklore', 'Jesús María, Córdoba · enero 2027', 'https://res.cloudinary.com/dwaouzfle/image/upload/c_fill,w_1080,h_700,q_auto/v1792645248/guiando/njujffjuprr9gcd8ygep.jpg', 'Foto: Maria Jose Malnis (CC BY-SA 2.0), vía Wikimedia Commons'),
  ('malambo', 'Festival Nacional del Malambo', 'Laborde, Córdoba · enero 2027', 'https://res.cloudinary.com/dwaouzfle/image/upload/c_fill,w_1080,h_700,q_auto/v1792646351/guiando/hkkvgfsstr7znuz8obbr.jpg', 'Foto: mechyp (CC BY-SA 3.0), vía Wikimedia Commons'),
  ('cosquin-rock', 'Cosquín Rock', 'Santa María de Punilla, Córdoba · 6 y 7 de febrero', 'https://res.cloudinary.com/dwaouzfle/image/upload/c_fill,w_1080,h_700,q_auto/v1792645281/guiando/bpxqxhkzi5tvvebdmolt.jpg', 'Foto: Arianza1 (CC BY-SA 4.0), vía Wikimedia Commons'),
  ('carnaval', 'Carnaval del País', 'Gualeguaychú, Entre Ríos · sábados de enero y febrero', 'https://res.cloudinary.com/dwaouzfle/image/upload/c_fill,w_1080,h_700,q_auto/v1792779384/guiando/wvniiofnxxpqcx79qzar.jpg', 'Fotos: Belgrano (dominio público) · Dario Alpern (CC BY-SA 3.0), vía Wikimedia Commons'),
]
def fest_html(name, where, img, credit):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
html,body{{width:1080px;height:1080px;background:#0A0A0A}}
.photo{{position:absolute;inset:0 0 380px 0;background:url('{img}') center/cover}}
.credit{{position:absolute;left:0;right:0;top:658px;padding:8px 24px;background:rgba(0,0,0,.6);color:#E7E5E4;font-size:17px}}
.brandbox{{position:absolute;left:40px;top:36px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)}}
.panel{{position:absolute;left:0;right:0;bottom:0;height:380px;background:linear-gradient(135deg,#BEF264,#84CC16 55%,#4D7C0F);padding:40px 56px;box-sizing:border-box;color:#0A0A0A}}
h1{{font-size:66px;line-height:1.02;margin:0 0 10px;font-weight:900;letter-spacing:-1px}}
.where{{font-size:30px;font-weight:700;color:#1A2E05;margin-bottom:26px}}
.cta{{position:absolute;right:56px;bottom:44px;font-size:24px;font-weight:800;color:#1A2E05}}
</style></head><body>
<div class="photo"></div><div class="brandbox brand"><img src="icon.png"><b>GuianDo</b></div>
<div class="credit">{credit}</div>
<div class="panel"><h1>{name}</h1><div class="where">📍 {where}</div>
<span class="stamp">🏅 Sello edición 2027</span><div class="cta">Recolectalo en la app →</div></div>
</body></html>"""
GENERAL = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
html,body{{width:1080px;height:1080px;background:linear-gradient(135deg,#BEF264,#84CC16 55%,#4D7C0F);color:#0A0A0A}}
.wrap{{position:absolute;inset:70px}} h1{{font-size:92px;line-height:.98;margin:70px 0 24px;font-weight:900;letter-spacing:-2px}}
p{{font-size:34px;font-weight:650;color:#1A2E05;margin:0 0 34px;line-height:1.25}}
.list{{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:40px}}.list span{{background:rgba(10,10,10,.88);color:#fff;border-radius:999px;padding:10px 22px;font-size:26px;font-weight:700}}
.foot{{position:absolute;bottom:0;left:0;font-size:28px;font-weight:800}}
</style></head><body><div class="wrap">
<div class="brand"><img src="icon.png"><b>GuianDo</b></div>
<h1>Verano de festivales</h1>
<p>Cada festival tiene su sello, que solo se recolecta durante la edición 2027. ¿Cuántos vas a juntar?</p>
<div class="list"><span>🎸 Cosquín Rock</span><span>🪕 Cosquín</span><span>🐎 Jesús María</span><span>👢 Malambo · Laborde</span><span>🎭 Carnaval · Gualeguaychú</span></div>
<span class="stamp">🏅 Sellos edición 2027</span>
<div class="foot">Gratis en guiando.com.ar/descargar</div></div></body></html>"""
STORY = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
html,body{{width:1080px;height:1920px;background:linear-gradient(160deg,#BEF264,#84CC16 50%,#4D7C0F);color:#0A0A0A}}
.wrap{{position:absolute;inset:150px 80px}} h1{{font-size:118px;line-height:.95;margin:120px 0 40px;font-weight:900;letter-spacing:-3px}}
p{{font-size:44px;font-weight:650;color:#1A2E05;line-height:1.25;margin:0 0 60px}}
.steps div{{font-size:42px;font-weight:800;margin-bottom:30px}}
.foot{{position:absolute;bottom:0;left:0;right:0;text-align:center;font-size:40px;font-weight:900;background:#0A0A0A;color:#A3E635;border-radius:28px;padding:34px}}
</style></head><body><div class="wrap">
<div class="brand"><img src="icon.png"><b>GuianDo</b></div>
<h1>Este verano, coleccioná festivales</h1>
<p>Los festivales tienen un sello que solo se puede recolectar mientras se hace la edición 2027.</p>
<div class="steps"><div>1. Descargá GuianDo</div><div>2. Andá al festival</div><div>3. Abrí la ficha y tocá Recolectar 🏅</div><div>4. Compartí tu colección</div></div>
<div class="foot">guiando.com.ar/descargar</div></div></body></html>"""
here = pathlib.Path(__file__).parent
pieces = [('post-general', GENERAL, (1080, 1080)), ('story-general', STORY, (1080, 1920))]
pieces += [(f'post-{k}', fest_html(n, w, i, c), (1080, 1080)) for k, n, w, i, c in FESTS]
for name, html, (w, h) in pieces:
    f = here / f'{name}.html'; f.write_text(html, encoding='utf-8')
    subprocess.run([CHROME, '--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1', f'--window-size={w},{h}',
                    '--virtual-time-budget=8000', f'--screenshot={here / (name + ".png")}', f.as_uri()], check=True, capture_output=True)
    print('ok', name)
