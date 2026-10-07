/**
 * Learning grid "load more": appends further 3-card rows from the core
 * posts endpoint, honouring the initial server-rendered offset (first two
 * cards plus the first row of three). render.php only prints the button
 * when data-total (WP_Query::found_posts) exceeds the initial offset, and
 * here the button is hidden for good as soon as `offset` reaches that
 * known total — no trailing fetch needed just to learn there's nothing
 * left. Card markup mirrors hub_gsct2026_learning_card() in
 * inc/helpers.php — keep the two in sync.
 */
export function initLearningGrids() {
	document.querySelectorAll('.hub-learning-posts-grid__grid').forEach((grid) => {
		const button = grid.parentElement.querySelector('.hub-learning-posts-grid__more');
		if (!button) return;

		const categoryId = grid.getAttribute('data-category');
		const perPage = parseInt(grid.getAttribute('data-per-page') || '3', 10);
		const total = parseInt(grid.getAttribute('data-total') || '0', 10);
		let offset = parseInt(grid.getAttribute('data-offset') || '0', 10);

		if (!categoryId || offset >= total) {
			button.hidden = true;
			return;
		}

		const decodeEntities = (text) => {
			const area = document.createElement('textarea');
			area.innerHTML = text || '';
			return area.value;
		};

		// Everything interpolated below is admin-authored REST content, but
		// decodeEntities() turns entities back into live characters (a title
		// containing "<3" would parse as markup), so re-escape on the way
		// into innerHTML — mirrors esc_html()/esc_url() server-side.
		const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({
			'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
		}[c]));

		const words = (html, count) => {
			const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
			const parts = text.split(' ').filter(Boolean);
			return parts.length > count ? parts.slice(0, count).join(' ') + '…' : parts.join(' ');
		};

		const formatDate = (iso) => {
			const date = new Date(iso);
			return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
		};

		const cardHtml = (post) => {
			const terms = ((post._embedded || {})['wp:term'] || []).flat();
			const cat = terms.find((term) => term.taxonomy === 'category' && term.slug !== 'uncategorized');
			const media = (((post._embedded || {})['wp:featuredmedia'] || [])[0]) || null;
			const title = decodeEntities(post.title?.rendered || '');
			const thumb = media
				? `<img src="${esc(media.source_url)}" alt="${esc(title)}">`
				: '';
			const excerpt = words(post.excerpt?.rendered || '', 25);
			return `<div class="col-12 col-md-6 col-lg-4">` +
				`<a class="hub-insight-card post-${post.id} type-post status-publish" href="${esc(post.link)}">` +
				`<div class="hub-insight-card__media${thumb ? '' : ' hub-insight-card__media--empty'}">${thumb}` +
				(cat ? `<span class="hub-insight-card__badge">${esc(decodeEntities(cat.name))}</span>` : '') +
				`</div>` +
				`<p class="hub-insight-card__meta">${esc(formatDate(post.date))} · Article</p>` +
				`<h2 class="hub-insight-card__title h3-data-m">${esc(title)}</h2>` +
				(excerpt ? `<p class="hub-insight-card__excerpt text-body">${esc(excerpt)}</p>` : '') +
				`</a></div>`;
		};

		button.addEventListener('click', () => {
			button.disabled = true;
			const remaining = Math.min(perPage, total - offset);
			const url = `/wp-json/wp/v2/posts?categories=${categoryId}&per_page=${remaining}&offset=${offset}` +
				`&_fields=id,link,title,date,excerpt,_links,_embedded&_embed=wp:term,wp:featuredmedia`;
			fetch(url)
				.then((response) => {
					if (!response.ok) throw new Error(`posts fetch failed: ${response.status}`);
					return response.json().then((posts) => ({ posts }));
				})
				.then(({ posts }) => {
					posts.forEach((post) => {
						grid.insertAdjacentHTML('beforeend', cardHtml(post));
					});
					offset += posts.length;
					if (offset >= total || posts.length < remaining) {
						button.hidden = true;
					} else {
						button.disabled = false;
					}
				})
				.catch(() => {
					button.disabled = false;
				});
		});
	});
}
