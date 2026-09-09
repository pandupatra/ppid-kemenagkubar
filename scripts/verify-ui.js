;async (page) => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  const origin = page.url().split('/').slice(0, 3).join('/')
  const navigate = async (url) => {
    await page.goto(url)
    await page.waitForLoadState('networkidle')
  }
  await page.setViewportSize({ width: 1280, height: 800 })
  await navigate(origin)
  await page.getByRole('searchbox').fill('zzzz-no-results')
  await page.getByText('Informasi belum ditemukan', { exact: true }).waitFor()
  assert(
    (await page.locator('.document-row').count()) === 0,
    'Search must hide nonmatching documents',
  )
  await page.getByRole('searchbox').fill('standar')
  assert(
    (await page.locator('.document-row').count()) > 0,
    'Search must recover after an empty result',
  )

  await navigate(`${origin}/layanan-informasi/permohonan`)
  await page.getByRole('button', { name: 'Kirim permohonan' }).click()
  await page
    .getByText('Periksa kembali semua isian wajib sebelum melanjutkan.')
    .waitFor()
  assert(
    (await page.getByRole('status').count()) === 0,
    'Invalid form must not show review success',
  )
  for (const [label, value] of [
    ['Nama lengkap *', 'Pemohon Uji'],
    ['Alamat *', 'Alamat sintetis untuk pengujian'],
    ['Kontak WhatsApp *', '080000000000'],
    ['Judul atau nama informasi *', 'Dokumen uji'],
    [
      'Uraian atau rincian informasi *',
      'Permintaan sintetis untuk pemeriksaan UI',
    ],
    ['Tujuan penggunaan informasi *', 'Pengujian antarmuka'],
  ])
    await page.getByRole('textbox', { name: label, exact: true }).fill(value)
  await page.getByRole('button', { name: 'Kirim permohonan' }).click()
  assert(
    (await page.getByRole('status').count()) === 0,
    'Required selections must block review',
  )
  for (const name of ['Perseorangan', 'Dokumen digital atau PDF', 'Email'])
    await page.getByRole('radio', { name, exact: true }).check()
  for (const label of [
    'Saya menyatakan data yang saya sampaikan benar.',
    'Saya bersedia mengikuti ketentuan pelayanan informasi publik.',
    'Saya memahami bahwa informasi diberikan sesuai ketentuan peraturan perundang-undangan.',
  ])
    await page.getByRole('checkbox', { name: label, exact: true }).check()
  assert(
    !(await page
      .getByRole('button', { name: 'Kirim permohonan' })
      .isDisabled()),
    'Valid public intake data must enable submission',
  )

  await page.setViewportSize({ width: 360, height: 800 })
  await navigate(origin)
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await menu.click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  assert(
    (await dialog.getByRole('navigation').getByRole('link').count()) === 6,
    'Mobile menu must retain six links',
  )
  await page.keyboard.press('Tab')
  assert(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
    'Menu must contain keyboard focus',
  )
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  assert(
    await menu.evaluate((el) => document.activeElement === el),
    'Escape must restore menu trigger focus',
  )
  for (const route of [
    '/',
    '/profil',
    '/regulasi',
    '/standar-layanan',
    '/layanan-informasi',
    '/layanan-informasi/permohonan',
    '/layanan-informasi/lacak',
    '/layanan-informasi/keberatan',
  ]) {
    await navigate(`${origin}${route}`)
    assert(
      (await page.getByRole('heading', { level: 1 }).count()) === 1,
      `${route} must have one page heading`,
    )
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${route} overflows at 360px`,
    )
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await navigate(origin)
  assert(
    await page.evaluate(
      () =>
        getComputedStyle(document.documentElement).scrollBehavior === 'auto',
    ),
    'Reduced motion must disable smooth scrolling',
  )
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    'Home overflows at 200% text zoom',
  )
  await page.evaluate(() => {
    document.documentElement.style.fontSize = ''
  })
  console.log(
    'PASS: search, request validation and choices, mobile routes, menu focus, reduced motion, and text zoom',
  )
}
