import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Plus, Trash2, X } from 'lucide-react'

type Priority = 'СРОЧНО' | 'ХОЧУ' | 'КОГДА-НИБУДЬ'
type Wish = { id: string; name: string; price: number; category: string; priority: Priority; saved: number }

const starterWishes: Wish[] = [
  { id: '1', name: 'Плёночная камера', price: 78000, category: 'ТЕХНИКА', priority: 'СРОЧНО', saved: 24000 },
  { id: '2', name: 'Кресло для чтения', price: 46000, category: 'ДОМ', priority: 'ХОЧУ', saved: 12000 },
  { id: '3', name: 'Билеты в Токио', price: 128000, category: 'ПУТЕШЕСТВИЯ', priority: 'ХОЧУ', saved: 39000 },
  { id: '4', name: 'Виниловый проигрыватель', price: 32000, category: 'МУЗЫКА', priority: 'КОГДА-НИБУДЬ', saved: 0 },
]

const money = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(n))) + ' ₽'

function App() {
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('want-budget')) || 85000)
  const [wishes, setWishes] = useState<Wish[]>(() => {
    try { return JSON.parse(localStorage.getItem('want-wishes') || '') || starterWishes } catch { return starterWishes }
  })
  const [modal, setModal] = useState(false)
  const [budgetEdit, setBudgetEdit] = useState(false)
  const [sort, setSort] = useState<'priority' | 'price' | 'progress'>('priority')
  const [form, setForm] = useState({ name: '', price: '', category: 'ДРУГОЕ', priority: 'ХОЧУ' as Priority })

  useEffect(() => localStorage.setItem('want-budget', String(budget)), [budget])
  useEffect(() => localStorage.setItem('want-wishes', JSON.stringify(wishes)), [wishes])

  const sorted = useMemo(() => [...wishes].sort((a, b) => {
    if (sort === 'price') return a.price - b.price
    if (sort === 'progress') return (b.saved / b.price) - (a.saved / a.price)
    return ['СРОЧНО', 'ХОЧУ', 'КОГДА-НИБУДЬ'].indexOf(a.priority) - ['СРОЧНО', 'ХОЧУ', 'КОГДА-НИБУДЬ'].indexOf(b.priority)
  }), [wishes, sort])

  const total = wishes.reduce((s, w) => s + w.price, 0)
  const fullyAffordable = wishes.filter(w => budget >= w.price - w.saved).length

  const addWish = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(form.price)
    if (!form.name.trim() || price <= 0) return
    setWishes(v => [...v, { id: crypto.randomUUID(), name: form.name.trim(), price, category: form.category, priority: form.priority, saved: 0 }])
    setForm({ name: '', price: '', category: 'ДРУГОЕ', priority: 'ХОЧУ' })
    setModal(false)
  }

  const addToWish = (id: string) => {
    const raw = window.prompt('Сколько отложить на эту хотелку?')
    if (!raw) return
    const amount = Number(raw.replace(/\s/g, '').replace(',', '.'))
    if (amount > 0) setWishes(v => v.map(w => w.id === id ? { ...w, saved: Math.min(w.price, w.saved + amount) } : w))
  }

  return <div className="app-shell">
    <header>
      <a className="logo" href="#top">ХОЧУ<span>!</span></a>
      <nav><a href="#wishes">ХОТЕЛКИ</a><a href="#summary">СВОДКА</a></nav>
      <button className="add-top" onClick={() => setModal(true)}><Plus size={17}/> ДОБАВИТЬ</button>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ЛИЧНЫЙ ПЛАНИРОВЩИК ЖЕЛАНИЙ ДАРЬИ ИЛЬИНИЧНЫ — 2026</p>
          <h1>ПЛАНИРУЙ.<br/><span>КОПИ.</span><br/>ПОКУПАЙ.</h1>
          <p className="intro">Не откладывай мечты в дальний ящик. Считай, копи и смотри, как «когда-нибудь» превращается в «моё».</p>
        </div>
        <div className="hero-art">
          <div className="issue">ISSUE 01<br/>WANT / HAVE</div>
          <div className="red-orbit"></div><div className="black-disk">₽</div>
          <div className="scribble">⌁</div>
          <p>YOUR<br/>NEXT<br/>BIG<br/>THING</p>
        </div>
      </section>

      <section className="ticker"><div>ПЛАНИРУЙ • КОПИ • ПОКУПАЙ • ПОВТОРЯЙ • &nbsp; ПЛАНИРУЙ • КОПИ • ПОКУПАЙ • ПОВТОРЯЙ •</div></section>

      <section className="money-panel" id="summary">
        <div className="balance-block">
          <p>СЕЙЧАС У МЕНЯ</p>
          {budgetEdit ? <div className="budget-input"><input autoFocus type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}/><button onClick={() => setBudgetEdit(false)}><Check/></button></div> : <button className="balance" onClick={() => setBudgetEdit(true)}>{money(budget)} <span>ИЗМЕНИТЬ ↗</span></button>}
          <small>Сумма свободных денег. Нажми, чтобы изменить.</small>
        </div>
        <div className="stat"><strong>{wishes.length.toString().padStart(2, '0')}</strong><span>ХОТЕЛОК<br/>В СПИСКЕ</span></div>
        <div className="stat red"><strong>{fullyAffordable.toString().padStart(2, '0')}</strong><span>МОЖНО<br/>КУПИТЬ</span></div>
        <div className="stat"><strong>{money(total).replace(' ₽','')}</strong><span>₽ / ВСЕ<br/>ЖЕЛАНИЯ</span></div>
      </section>

      <section className="wishes" id="wishes">
        <div className="section-title"><div><p>МОЙ СПИСОК / {wishes.length}</p><h2>МОИ<br/><i>ХОТЕЛОЧКИ</i></h2></div>
          <label>СОРТИРОВКА <span><select value={sort} onChange={e => setSort(e.target.value as typeof sort)}><option value="priority">ПО ПРИОРИТЕТУ</option><option value="price">ПО ЦЕНЕ</option><option value="progress">ПО ПРОГРЕССУ</option></select><ChevronDown size={14}/></span></label>
        </div>

        <div className="wish-list">
          {sorted.map((wish, i) => {
            const left = Math.max(0, wish.price - wish.saved)
            const pct = Math.min(100, Math.round(wish.saved / wish.price * 100))
            const canBuy = budget >= left
            return <article className="wish-card" key={wish.id}>
              <div className="card-no">{String(i + 1).padStart(2, '0')}</div>
              <div className="card-main">
                <div className="tags"><span>{wish.category}</span><b className={wish.priority === 'СРОЧНО' ? 'urgent' : ''}>{wish.priority}</b></div>
                <h3>{wish.name}</h3>
                <div className="prices"><div><small>СТОИТ</small><strong>{money(wish.price)}</strong></div><div><small>ЕЩЁ НУЖНО</small><strong>{money(left)}</strong></div></div>
                <div className="progress"><span style={{width: `${pct}%`}}></span><em>{pct}%</em></div>
              </div>
              <div className="card-actions">
                <button className="delete" aria-label="Удалить" onClick={() => setWishes(v => v.filter(x => x.id !== wish.id))}><Trash2 size={17}/></button>
                <div className={`verdict ${canBuy ? 'yes' : ''}`}>{canBuy ? <><Check size={16}/> МОЖНО БРАТЬ</> : <><ArrowDown size={16}/> НЕ ХВАТАЕТ {money(left - budget)}</>}</div>
                <button className="save-more" onClick={() => addToWish(wish.id)}>ОТЛОЖИТЬ ЕЩЁ <ArrowUpRight size={18}/></button>
              </div>
            </article>
          })}
        </div>
        <button className="giant-add" onClick={() => setModal(true)}><Plus/> ДОБАВИТЬ НОВУЮ ХОТЕЛКУ</button>
      </section>
    </main>
    <footer><div>ХОЧУ<span>!</span></div><p>МЕЧТЫ ЛЮБЯТ ПЛАН.</p><small>ДАННЫЕ СОХРАНЯЮТСЯ В ЭТОМ БРАУЗЕРЕ</small></footer>

    {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(false)}>
      <form className="modal" onSubmit={addWish}>
        <button type="button" className="close" onClick={() => setModal(false)}><X/></button>
        <p className="eyebrow">НОВАЯ ЦЕЛЬ / NEW WANT</p><h2>ЧЕГО ТЫ<br/><i>ХОЧЕШЬ?</i></h2>
        <label>НАЗВАНИЕ<input required placeholder="Например, поездка в Исландию" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></label>
        <label>СКОЛЬКО СТОИТ<input required type="number" min="1" placeholder="120 000 ₽" value={form.price} onChange={e => setForm({...form, price:e.target.value})}/></label>
        <div className="form-row"><label>КАТЕГОРИЯ<select value={form.category} onChange={e => setForm({...form, category:e.target.value})}><option>ДРУГОЕ</option><option>ТЕХНИКА</option><option>ДОМ</option><option>ПУТЕШЕСТВИЯ</option><option>МУЗЫКА</option><option>ОДЕЖДА</option></select></label><label>ПРИОРИТЕТ<select value={form.priority} onChange={e => setForm({...form, priority:e.target.value as Priority})}><option>СРОЧНО</option><option>ХОЧУ</option><option>КОГДА-НИБУДЬ</option></select></label></div>
        <button className="submit">ДОБАВИТЬ В СПИСОК <ArrowUpRight/></button>
      </form>
    </div>}
  </div>
}

export default App
