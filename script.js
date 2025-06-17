// script.js の内容 (変更なしですが、確実な上書きをお願いします)

document.addEventListener('DOMContentLoaded', () => {
    // ローディング画面制御
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 1000);
    });
    setTimeout(() => { // 念のため、少し遅れてフェードアウト
        loadingOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // スクロール可能に
    }, 500); // 0.5秒後に非表示を開始
    // プログレスバー更新
    const updateProgressBar = () => {
        const docElem = document.documentElement;
        const scrollPos = docElem.scrollTop;
        const scrollHeight = docElem.scrollHeight - docElem.clientHeight;
        const progress = (scrollPos / scrollHeight) * 100;
        progressBar.style.width = `${progress}%`;
    };
    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar(); // 初期表示時にも更新
    // スクロールアニメーション (Intersection Observer)
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // highlight-yellow と section-title の下線アニメーションをトリガー
                const highlightYellowElement = entry.target.querySelector('.highlight-yellow');
                if (highlightYellowElement) {
                    highlightYellowElement.classList.add('is-visible');
                }
                const sectionTitleElement = entry.target.querySelector('.section-title');
                // trust-section内のタイトルは個別のスタイルがあるため、is-visible付与を抑制
                if (sectionTitleElement && !entry.target.closest('.trust-section')) { 
                    sectionTitleElement.classList.add('is-visible');
                }
            } else {
                // 画面外に出たらアニメーションをリセットする (オプション)
                // entry.target.classList.remove('is-visible');
                const highlightYellowElement = entry.target.querySelector('.highlight-yellow');
                if (highlightYellowElement) {
                    highlightYellowElement.classList.remove('is-visible');
                }
                const sectionTitleElement = entry.target.querySelector('.section-title');
                if (sectionTitleElement && !entry.target.closest('.trust-section')) {
                    sectionTitleElement.classList.remove('is-visible');
                }
            }
        });
    };
    const intersectionObserver = new IntersectionObserver(animateOnScroll, {
        root: null, // ビューポートをルートとする
        rootMargin: '0px',
        threshold: 0.1 // 10%が見えたら発火
    });
    // animated-itemを持つ要素を監視
    document.querySelectorAll('.animated-item').forEach(el => {
        intersectionObserver.observe(el);
    });
    // 音響効果（オプション - ユーザーの許可が必要）
    function playClickSound() {
        // デバッグパネルで音響効果がオフになっていたら再生しない
        if (window.luxuryDebug && !luxuryDebug.isSoundEnabled()) {
            return;
        }
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.05); // A5まで急速に上がる
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // console.error("Audio playback error:", e); // デバッグ用
        }
    }
    // CTAボタンに効果音を追加（ユーザーインタラクション後）
    let audioEnabled = false;
    document.addEventListener('click', () => {
        if (!audioEnabled) {
            audioEnabled = true; // 初回クリックで音声再生を許可
        }
    }, { once: true }); // 一度だけ実行
    document.querySelectorAll('.cta-button-image-link').forEach(button => {
        button.addEventListener('click', () => {
            if (audioEnabled) {
                playClickSound();
            }
        });
    });
    // 磁石効果（CTAボタンにマウスが近づくと引き寄せられる）
    document.querySelectorAll('.cta-button-image').forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            const maxDistance = 100; // この距離内で効果が発動
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance; // 0 (遠い) to 1 (近い)
                const moveX = deltaX * force * 0.1; // 移動量調整
                const moveY = deltaY * force * 0.1;
                
                let newTransform = `translate(${moveX}px, ${moveY}px)`;
                
                if (this.style.transform.includes('scale')) {
                    const scaleMatch = this.style.transform.match(/scale\((.*?)\)/);
                    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
                    newTransform += ` scale(${currentScale + force * 0.05})`;
                } else {
                     newTransform += ` scale(${1 + force * 0.05})`;
                }
                
                if (this.style.transform.includes('rotate')) {
                    const rotateXMatch = this.style.transform.match(/rotateX\((.*?)\)/);
                    const rotateYMatch = this.style.transform.match(/rotateY\((.*?)\)/);
                    const rotateZMatch = this.style.transform.match(/rotateZ\((.*?)\)/);
                    if (rotateXMatch) newTransform += ` rotateX(${rotateXMatch[1]})`;
                    if (rotateYMatch) newTransform += ` rotateY(${rotateYMatch[1]})`;
                    if (rotateZMatch) newTransform += ` rotateZ(${rotateZMatch[1]})`;
                }
                this.style.transform = `perspective(1000px) ${newTransform}`;
            } else {
                // 距離が遠くなったら元に戻す
                this.style.transform = 'perspective(1000px) scale(1)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            // マウスが離れたら元のCSSアニメーションと変形に戻す
            this.style.transform = ''; // インラインスタイルをリセット
        });
    });
    // スムーススクロールの実装 (既存LPより)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    /* === お客様の声カルーセル機能の統合 === */
    class LuxuryTestimonials {
        constructor() {
            this.track = document.getElementById('testimonialTrack');
            this.prevBtn = document.getElementById('prevBtn');
            this.nextBtn = document.getElementById('nextBtn');
            this.indicatorsContainer = document.getElementById('indicators');
            this.cards = this.track.querySelectorAll('.testimonial-card');
            this.currentIndex = 0;
            this.isAnimating = false;
            this.autoplayInterval = null;
            this.isTextMarked = false; // 新規追加: テキストマーカー適用済みフラグ
            this.startX = 0;
            this.currentTranslate = 0;
            this.prevTranslate = 0;
            this.animationID = null;
            this.startY = 0; // 追加: 縦方向の開始座標
            this.isScrollingVertically = false; // 追加: 縦スクロール中かどうかのフラグ
            this.init();
        }
        init() {
            this.createIndicators();
            this.setupEventListeners();
            this.startAutoplay();
            this.animateStars();
            this.applyDynamicTextMarker(); // ★新規追加: 動的マーカー適用関数を呼び出す
        }
        createIndicators() {
            this.indicatorsContainer.innerHTML = ''; // インジケーターをクリア
            this.cards.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                indicator.addEventListener('click', () => this.goToSlide(index));
                this.indicatorsContainer.appendChild(indicator);
            });
        }
        setupEventListeners() {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
            
            // ホバー時に自動再生を停止
            const carousel = document.getElementById('testimonialCarousel');
            carousel.addEventListener('mouseenter', () => this.stopAutoplay());
            carousel.addEventListener('mouseleave', () => this.startAutoplay());
            
            // キーボードナビゲーション
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });
            // マウス追従による3D傾斜効果を削除
            // document.querySelectorAll('.testimonial-card').forEach(card => {
            //     card.addEventListener('mousemove', function(e) {
            //         const rect = this.getBoundingClientRect();
            //         const x = e.clientX - rect.left;
            //         const y = e.clientY - rect.top;
                    
            //         const centerX = rect.width / 2;
            //         const centerY = rect.height / 2;
                    
            //         const rotateX = (y - centerY) / 20; // 傾斜の度合いを調整
            //         const rotateY = (centerX - x) / 20;
                    
            //         this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            //     });
                
            //     card.addEventListener('mouseleave', function() {
            //         this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            //     });
            // });
            // スワイプジェスチャーイベントリスナー
            this.track.addEventListener('touchstart', this.touchStart.bind(this));
            this.track.addEventListener('touchmove', this.touchMove.bind(this));
            this.track.addEventListener('touchend', this.touchEnd.bind(this));
            this.track.addEventListener('touchcancel', this.touchEnd.bind(this));
        }
        touchStart(e) {
            this.isAnimating = true; // アニメーション中フラグを設定
            this.stopAutoplay();
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY; // 追加
            this.prevTranslate = this.currentTranslate;
            cancelAnimationFrame(this.animationID);
            this.isScrollingVertically = false; // リセット
        }
        touchMove(e) {
            if (!this.isAnimating) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY; // 追加
            const diffX = currentX - this.startX;
            const diffY = currentY - this.startY; // 追加
            // スクロール方向を判定
            // 横方向の移動量が縦方向の移動量よりも大きい場合にのみ preventDefault() を呼び出す
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) { // 閾値10pxを設定
                e.preventDefault(); // 横スクロールが優勢な場合のみデフォルトの縦スクロールを抑制
                this.currentTranslate = this.prevTranslate + diffX;
                this.setSliderPosition();
            } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
                // 縦スクロールが優勢な場合は、何もせずブラウザのデフォルト動作を許可
                this.isScrollingVertically = true; // 縦スクロール中フラグを設定
                this.isAnimating = false; // カルースルアニメーションを停止
                this.startAutoplay(); // オートプレイ再開
            }
        }
        touchEnd() {
            if (this.isScrollingVertically) { // 縦スクロール中に終了した場合はカルーセル操作を確定しない
                this.isAnimating = false;
                this.startAutoplay();
                return;
            }
            this.isAnimating = false;
            const movedBy = this.currentTranslate - this.prevTranslate;
            if (movedBy < -100) { // 左にスワイプ
                this.nextSlide();
            } else if (movedBy > 100) { // 右にスвайプ
                this.prevSlide();
            } else { // 十分な移動がない場合は元の位置に戻す
                this.goToSlide(this.currentIndex);
            }
            this.startAutoplay();
        }
        setSliderPosition() {
            this.track.style.transform = `translateX(${this.currentTranslate}px)`;
        }
        goToSlide(index) {
            if (this.isAnimating) return;
            
            this.isAnimating = true;
            this.currentIndex = index;
            
            const cardWidth = this.cards[0].offsetWidth; // カードの幅を取得
            const translateX = -index * cardWidth;
            this.track.style.transform = `translateX(${translateX}px)`; // px単位で移動
            this.currentTranslate = translateX; // 現在のtranslateを更新
            this.prevTranslate = translateX; // PrevTranslateも更新
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 800);
            
            this.updateIndicators();
            this.updateButtons();
        }
        nextSlide() {
            const nextIndex = (this.currentIndex + 1) % this.cards.length;
            this.goToSlide(nextIndex);
        }
        prevSlide() {
            const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
            this.goToSlide(prevIndex);
        }
        updateIndicators() {
            const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentIndex);
            });
        }
        updateButtons() {
            // ループするカルーセルの場合、ボタンは常に有効
            this.prevBtn.disabled = false;
            this.nextBtn.disabled = false;
        }
        startAutoplay() {
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => {
                if (this.currentIndex === this.cards.length - 1) {
                    this.goToSlide(0);
                } else {
                    this.nextSlide();
                }
            }, 5000);
        }
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }
        animateStars() {
            const stars = document.querySelectorAll('.star.filled');
            stars.forEach((star, index) => {
                star.style.animation = 'starTwinkle 2s ease-in-out infinite';
                star.style.animationDelay = `${index * 0.2}s`;
            });
        }
        // ★新規追加: テキスト内容に基づいて動的にマーカーを適用する関数
        applyDynamicTextMarker() {
            if (this.isTextMarked) return; // 既に適用済みなら何もしない
            this.isTextMarked = true;
            // マーカーのパターンを定義
            // { text: 検索するテキスト, className: 適用するクラス名 }
            const markerPatterns = [
                { text: "自分の体の状態を数値で見ることができ、生活習慣を見直すきっかけになりました。", className: "voice-highlight-dynamic" },
                { text: "腸内環境の状態を知ることで、食事や生活習慣について考え直すことができました。", className: "voice-highlight-dynamic" },
                { text: "自分の腸内環境の状態を知ることができました。", className: "voice-highlight-dynamic" },
                { text: "検査結果で自分の状態を知ることができ、生活習慣について見直すことができました。", className: "voice-highlight-dynamic" }
            ];
            // 各testimonial-quote要素に対して処理
            document.querySelectorAll('.testimonial-quote').forEach(quoteElement => {
                let originalHtml = quoteElement.innerHTML;
                let modifiedHtml = originalHtml;
                markerPatterns.forEach(pattern => {
                    // 正規表現で検索文字列をエスケープし、グローバル検索を有効にする
                    const regex = new RegExp(`(${pattern.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
                    // 注意: すでにspanで囲まれている場合は二重にならないようにする
                    // ただし、このチェックは簡易的なものなので、より厳密な実装が必要な場合はDOMパースなどが必要
                    if (!modifiedHtml.includes(`<span class="${pattern.className}">`) && regex.test(originalHtml)) {
                        modifiedHtml = modifiedHtml.replace(regex, `<span class="${pattern.className}">$1</span>`);
                    }
                });
                if (originalHtml !== modifiedHtml) {
                    quoteElement.innerHTML = modifiedHtml;
                }
            });
        }
    }
    /* === 高級統計・信頼性セクション - JavaScript実装 === */
    class LuxuryStatistics {
        constructor() {
            this.init();
            /* setupIntersectionObserverForStats() は animateOnScroll と重複するため削除しました */
        }
        init() {
            // カウントアップアニメーション
            this.animateCounters();
            this.animateProgressBars();
            this.addMouseTrackingEffect(); // マウス追跡効果を追加
        }
        animateCounters() {
            const counters = document.querySelectorAll('.trust-section [data-count]'); // trust-section内のカウンターのみ対象
            
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.count);
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.floor(current);
                        counter.classList.add('counting');
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                        counter.classList.remove('counting');
                        this.createCounterParticles(counter);
                    }
                };
                // intersection observerで可視化された後にアニメーションを開始
                counter.dataset.startAnimation = 'false'; // 初期状態
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.target.dataset.startAnimation === 'false') {
                            entry.target.dataset.startAnimation = 'true';
                            updateCounter();
                            observer.unobserve(entry.target); // 一度実行したら監視を停止
                        }
                    });
                }, { threshold: 0.7 }); // 70%見えたら発火
                observer.observe(counter);
            });
        }
        animateProgressBars() {
            const progressBars = document.querySelectorAll('.trust-section .progress-bar'); // trust-section内のプログレスバーのみ対象
            
            progressBars.forEach((bar) => {
                const progress = parseInt(bar.dataset.progress);
                bar.dataset.startAnimation = 'false'; // 初期状態
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.target.dataset.startAnimation === 'false') {
                            entry.target.dataset.startAnimation = 'true';
                            entry.target.style.width = `${progress}%`;
                            observer.unobserve(entry.target); // 一度実行したら監視を停止
                        }
                    });
                }, { threshold: 0.7 }); // 70%見えたら発火
                observer.observe(bar);
            });
        }
        createCounterParticles(counter) {
            // デバッグパネルでパーティクルがオフになっていたら再生しない
            if (window.luxuryDebug && !luxuryDebug.isParticleEnabled()) {
                return;
            }
            const rect = counter.getBoundingClientRect();
            const particleCount = 5; // ★修正: 10から5に減らしました
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = rect.left + rect.width / 2 + 'px';
                particle.style.top = rect.top + rect.height / 2 + Math.random() * 20 + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = 'var(--luxury-accent)';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                particle.style.boxShadow = '0 0 10px var(--luxury-accent)';
                
                document.body.appendChild(particle);
                
                const angle = (Math.PI * 2 * i) / particleCount;
                const distance = 50 + Math.random() * 50;
                const endX = rect.left + rect.width / 2 + Math.cos(angle) * distance;
                const endY = rect.top + rect.height / 2 + Math.sin(angle) * distance;
                
                particle.animate([
                    { 
                        transform: 'scale(1)',
                        opacity: 1
                    },
                    { 
                        transform: `translate(${endX - rect.left - rect.width/2}px, ${endY - rect.top - rect.height/2}px) scale(0)`,
                        opacity: 0
                    }
                ], {
                    duration: 1000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => particle.remove();
            }
        }
        // 統計カードのマウス追従効果
        addMouseTrackingEffect() {
            const statCards = document.querySelectorAll('.trust-section .stat-card');
            
            statCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
                });
            }
            );
        }
    }
    /* === 高級統計・信頼性セクション - JavaScript実装 END === */
    // 初期化を遅延させるためのオブザーバー
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'voice-section-js' && !window.luxuryTestimonialsInstance) {
                    window.luxuryTestimonialsInstance = new LuxuryTestimonials();
                }
                if (entry.target.id === 'trust-section-js' && !window.luxuryStatisticsInstance) {
                    window.luxuryStatisticsInstance = new LuxuryStatistics();
                }
                observer.unobserve(entry.target); // 一度初期化したら監視を停止
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    // HTMLにIDがない場合は、要素を追加
    // HTML内にIDが直接記載されているため、このチェックは不要または冗長になりますが、念のため残しておきます。
    if (!document.getElementById('voice-section-js')) {
        const voiceSection = document.querySelector('.voice-section');
        if (voiceSection) voiceSection.id = 'voice-section-js';
    }
    if (!document.getElementById('trust-section-js')) {
        const trustSection = document.querySelector('.trust-section');
        if (trustSection) trustSection.id = 'trust-section-js';
    }
    sectionObserver.observe(document.getElementById('voice-section-js'));
    sectionObserver.observe(document.getElementById('trust-section-js'));
    
    /* --- 申し込みフォームのJavaScriptここから --- */
    class LuxuryForm {
        constructor(formElement) {
            this.form = formElement;
            this.inputs = this.form.querySelectorAll('input:not([name="bot-field"])'); // bot-fieldを除外
            this.submitBtn = this.form.querySelector('.luxury-submit-btn');
            this.successDiv = document.getElementById('formSuccess');
            this.addressStatus = document.getElementById('addressStatus');
            
            this.initEventListeners();
            this.resetForm(); // 初期化時にフォームをリセット
        }
        initEventListeners() {
            // リアルタイムバリデーション
            this.inputs.forEach(input => {
                input.addEventListener('input', () => this.validateInput(input));
                input.addEventListener('blur', () => this.validateInput(input));
            });
            // 郵便番号自動補完
            const zipcodeInput = document.getElementById('zipcode');
            if (zipcodeInput) { // zipcode inputが存在する場合のみ
                zipcodeInput.addEventListener('input', () => this.handleZipcodeInput());
            }
            // フォーム送信
            // Netlify Formsにデータを送信するため、JavaScriptでのfetch送信ではなく、
            // フォームのHTML属性に任せる形に変更します。
            // したがって、handleSubmitの内容は成功メッセージの表示とリセットのみに絞り、
            // 実際にはformのsubmitイベントが発火しNetlifyが処理します。
            this.form.addEventListener('submit', (e) => this.handleLocalSubmit(e));
            // 入力フィールドにフォーカス時のキラキラエフェクト
            document.querySelectorAll('.floating-label-group input').forEach(input => {
                input.addEventListener('focus', function() {
                    createFocusSparkles(this);
                });
            });
        }
        validateInput(input) {
            // .validation-icon はHTMLに存在しない場合があるため、ここでは直接扱わない
            // ただし、以前の完全版のHTMLでは存在していたため、CSS定義は残しています。
            const isValid = input.checkValidity() && input.value.trim() !== '';
            
            input.classList.remove('valid', 'invalid');
            
            if (input.value.trim() === '') {
                return;
            }
            
            if (isValid) {
                input.classList.add('valid');
                // .validation-icon の表示はCSSで制御されている
                this.createValidationParticles(input);
            } else {
                input.classList.add('invalid');
                // .validation-icon の表示はCSSで制御されている
                this.shakeInput(input);
            }
        }
        createValidationParticles(input) {
            // デバッグパネルでパーティクルがオフになっていたら再生しない
            if (window.luxuryDebug && !luxuryDebug.isParticleEnabled()) {
                return;
            }
            const rect = input.getBoundingClientRect();
            const particles = 3; // ★修正: 5から3に減らしました
            
            for (let i = 0; i < particles; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = rect.right - 30 + Math.random() * 20 + 'px';
                particle.style.top = rect.top + rect.height / 2 + Math.random() * 20 + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = 'var(--primary-green)';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                particle.style.boxShadow = '0 0 10px var(--primary-green)'; /* var(--luxury-accent) に修正してもよい */
                
                document.body.appendChild(particle);
                
                // パーティクルアニメーション
                particle.animate([
                    { transform: 'scale(1) translateY(0)', opacity: 1 },
                    { transform: 'scale(0) translateY(-30px)', opacity: 0 }
                ], {
                    duration: 800,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => particle.remove();
            }
        }
        shakeInput(input) {
            input.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(0)' }
            ], {
                duration: 500,
                easing: 'ease-in-out'
            });
        }
        async handleZipcodeInput() {
            const zipcode = document.getElementById('zipcode').value.replace(/[^0-9]/g, '');
            const addressInput = document.getElementById('address');
            
            // 郵便番号が7桁になったら検索を開始
            if (zipcode.length === 7) {
                if (this.addressStatus) { // addressStatus要素が存在する場合のみ
                    this.showAddressStatus('住所を検索中...', 'loading');
                }
                
                try {
                    const result = await this.fetchAddress(zipcode);
                    if (result) {
                        addressInput.value = result;
                        addressInput.removeAttribute('readonly');
                        this.validateInput(addressInput);
                        if (this.addressStatus) {
                            this.showAddressStatus('住所が自動入力されました', 'success');
                        }
                        
                        setTimeout(() => {
                            if (this.addressStatus) this.hideAddressStatus();
                        }, 3000);
                    } else {
                        this.handleAddressError();
                    }
                } catch (error) {
                    this.handleAddressError();
                }
            } else {
                addressInput.value = '';
                addressInput.setAttribute('readonly', true);
                if (this.addressStatus) this.hideAddressStatus();
                // 郵便番号が7桁未満になったらバリデーション状態をリセット
                const zipcodeInput = document.getElementById('zipcode');
                zipcodeInput.classList.remove('valid', 'invalid');
            }
        }
        // LPコードにあったマルチAPI対応のfetchAddressを移植
        async fetchAddress(zipCode) {
            return new Promise(async (resolve, reject) => {
                const addressAPIs = [
                    {
                        name: 'zipcode-jp',
                        fetch: () => {
                            return new Promise((resolveInner, rejectInner) => {
                                const callbackName = 'zipcode_callback_' + Date.now();
                                const script = document.createElement('script');
                                
                                const timeoutId = setTimeout(() => {
                                    cleanup();
                                    rejectInner(new Error('タイムアウト'));
                                }, 8000); // 8秒タイムアウト
                                const cleanup = () => {
                                    clearTimeout(timeoutId);
                                    if (script.parentNode) {
                                        document.head.removeChild(script);
                                    }
                                    delete window[callbackName];
                                };
                                window[callbackName] = (data) => {
                                    cleanup();
                                    try {
                                        if (data && data.code === 200 && data.data) {
                                            const address = `${data.data.prefecture}${data.data.city}${data.data.town || ''}`;
                                            resolveInner({ success: true, address });
                                        } else {
                                            resolveInner({ success: false, message: '住所が見つかりませんでした (zipcode-jp)' });
                                        }
                                    } catch (error) {
                                        rejectInner(error);
                                    }
                                };
                                script.onerror = () => {
                                    cleanup();
                                    rejectInner(new Error('ネットワークエラー (zipcode-jp)'));
                                };
                                script.src = `https://zipcode-jp.com/${zipCode}.js?callback=${callbackName}`;
                                document.head.appendChild(script);
                            });
                        }
                    },
                    {
                        name: 'zipaddress.net',
                        fetch: async () => {
                            const url = `https://api.zipaddress.net/?zipcode=${zipCode}`;
                            try {
                                const response = await fetch(url, {
                                    method: 'GET',
                                    headers: {
                                        'Accept': 'application/json',
                                    }
                                });
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                }
                                const data = await response.json();
                                if (data.code === 200 && data.data) {
                                    const result = data.data;
                                    const address = `${result.pref}${result.city}${result.town || ''}`;
                                    return { success: true, address };
                                } else {
                                    return { success: false, message: '住所が見つかりませんでした (zipaddress.net)' };
                                }
                            } catch (error) {
                                throw new Error(`検索に失敗しました: ${error.message} (zipaddress.net)`);
                            }
                        }
                    }
                ];
                for (const api of addressAPIs) {
                    try {
                        const result = await api.fetch();
                        if (result.success) {
                            resolve(result.address);
                            return;
                        }
                    } catch (error) {
                        // console.error(`API ${api.name} failed:`, error); // デバッグ用
                        continue;
                    }
                }
                resolve(null); // 全てのAPIで失敗した場合
            });
        }
        handleAddressError() {
            const addressInput = document.getElementById('address');
            addressInput.value = '';
            addressInput.removeAttribute('readonly');
            if (this.addressStatus) {
                this.showAddressStatus('住所が見つかりません。手入力してください。', 'error');
                setTimeout(() => this.hideAddressStatus(), 5000);
            }
        }
        showAddressStatus(message, type) {
            if (this.addressStatus) {
                this.addressStatus.textContent = message;
                this.addressStatus.className = `address-status visible ${type}`;
            }
        }
        hideAddressStatus() {
            if (this.addressStatus) {
                this.addressStatus.classList.remove('visible');
            }
        }
        // ★修正: Netlify Formsにデータを送信するための新しいハンドル関数
        async handleLocalSubmit(e) {
            e.preventDefault(); // デフォルトの送信を一時的に抑制
            
            // 全フィールドのバリデーション
            let isFormValid = true;
            this.inputs.forEach(input => {
                this.validateInput(input);
                if (!input.checkValidity() || input.value.trim() === '') {
                    isFormValid = false;
                }
            });
            if (!isFormValid) {
                this.shakeForm();
                return;
            }
            
            // ローディング状態
            this.submitBtn.classList.add('loading');
            
            // フォームデータをFormDataオブジェクトに変換
            const formData = new FormData(this.form);
            
            // Netlify Formsに送信 (hidden iframeを使ってページ遷移なしで送信)
            // または、JavaScriptのFetch APIで送信（Netlifyの推奨方法の一つ）
            // Netlifyのドキュメント: https://docs.netlify.com/forms/setup/#submit-html-forms-with-ajax
            try {
                await fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString(),
                });
                
                // 成功処理
                this.showSuccess();
            } catch (error) {
                console.error("Form submission error:", error);
                alert("フォームの送信中にエラーが発生しました。もう一度お試しください。");
                this.submitBtn.classList.remove('loading');
            }
        }
        
        shakeForm() {
            this.form.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(0)' }
            ], {
                duration: 500,
                easing: 'ease-in-out'
            });
        }
        showSuccess() {
            this.form.style.display = 'none';
            this.successDiv.classList.add('show');
            this.createConfetti();
            
            // 効果音（ユーザーインタラクション後のみ）
            this.playSuccessSound();
        }
        createConfetti() {
            // デバッグパネルでパーティクルがオフになっていたら再生しない
            if (window.luxuryDebug && !luxuryDebug.isParticleEnabled()) {
                return;
            }
            // LPのグリーン系アクセントカラーと他の色を混ぜる
            const colors = [
                'var(--luxury-accent)', 
                'var(--luxury-accent-dark)', 
                '#98FB98', // 薄い緑
                '#87CEEB', // 水色
                'var(--highlight-yellow)'
            ];
            const confettiCount = 25; // ★修正: 50から25に減らしました
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                // confetti-fall アニメーションで top は自動で設定されるため、初期値はビューポートのトップ外に設定
                // left はランダムに設定
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = -10 + 'px'; // 画面外上部から開始
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '1000';
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 再度設定
                confetti.style.animation = `confetti-fall ${confetti.style.animationDuration} linear forwards`; // アニメーションを直接適用
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), parseFloat(confetti.style.animationDuration) * 1000); // アニメーション終了後に削除
            }
        }
        playSuccessSound() {
            // デバッグパネルでパーティクルがオフになっていたら再生しない
            if (window.luxuryDebug && !luxuryDebug.isSoundEnabled()) {
                return;
            }
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // 成功音のメロディー
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                
                notes.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                    }, index * 150);
                });
            } catch (error) {
                // console.error("Success audio playback error:", error); // デバッグ用
            }
        }
        // フォームのリセットメソッドをLuxuryFormクラスに追加
        resetForm() {
            this.form.reset(); // フォームの入力値をリセット
            this.inputs.forEach(input => {
                input.classList.remove('valid', 'invalid'); // バリデーション状態をリセット
            });
            if (this.addressStatus) this.hideAddressStatus(); // 住所ステータスを非表示に
            this.successDiv.classList.remove('show'); // 成功メッセージを非表示に
            // ★修正箇所: display: block; をクラス操作に置き換え
            this.form.classList.remove('form-initial-hidden');
            this.submitBtn.classList.remove('loading'); // ローディング状態を解除
        }
    }
    /* --- 申し込みフォームのJavaScriptここまで --- */
    // CTAボタンとLuxuryFormの連携ロジック
    let luxuryFormInstance = null; // LuxuryFormのインスタンスを保持する変数
    const orderFormContainer = document.getElementById('order-form-direct'); // HTMLにid="order-form-direct"が定義されているため
    const orderFormElement = orderFormContainer.querySelector('form');
    
    const ctaButtons = [
        document.getElementById('cta-button-open-form-top'),
        document.getElementById('cta-button-open-form-2'),
        document.getElementById('cta-button-open-form-3')
    ];
    ctaButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // ★修正箇所: display: block/none をクラス操作に置き換え
                if (orderFormContainer.classList.contains('form-initial-hidden')) {
                    // フォームが非表示の場合は表示する
                    orderFormContainer.classList.remove('form-initial-hidden');
                    orderFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // LuxuryFormを初期化またはリセット
                    if (!luxuryFormInstance) {
                        luxuryFormInstance = new LuxuryForm(orderFormElement);
                    } else {
                        luxuryFormInstance.resetForm();
                    }
                } else {
                    // フォームが既に表示されている場合は閉じる
                    orderFormContainer.classList.add('form-initial-hidden');
                    if (luxuryFormInstance) {
                        luxuryFormInstance.resetForm(); // 閉じる時にリセット
                    }
                }
            });
        }
    });
    // フォーカス時のキラキラエフェクト関数 (LuxuryFormクラスの外部に定義)
    function createFocusSparkles(input) {
        // デバッグパネルでパーティクルがオフになっていたら再生しない
        if (window.luxuryDebug && !luxuryDebug.isParticleEnabled()) {
                return;
            }
        const rect = input.getBoundingClientRect();
        const sparkleCount = 4; // ★修正: 8から4に減らしました
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.left = rect.left + Math.random() * rect.width + 'px';
            sparkle.style.top = rect.top + Math.random() * rect.height + 'px';
            sparkle.style.width = '3px';
            sparkle.style.height = '3px';
            sparkle.style.background = 'var(--luxury-accent)';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            sparkle.style.boxShadow = '0 0 6px var(--luxury-accent)';
            
            document.body.appendChild(sparkle);
            
            sparkle.animate([
                { 
                    transform: 'scale(0) rotate(0deg)', 
                    opacity: 1 
                },
                { 
                    transform: 'scale(1) rotate(180deg)', 
                    opacity: 1,
                    offset: 0.5
                },
                { 
                    transform: 'scale(0) rotate(360deg)', 
                    opacity: 0 
                }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
        }
    }
});


// 開発用デバッグパネル（本番環境では自動的に無効）
class LuxuryDebugPanel {
    constructor() {
        // ★セキュリティ対策: デバッグパネルはlocalhostでのみ表示し、本番環境では無効にする
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isDebugMode = window.location.search.includes('debug=true'); // debug=true パラメータがある場合
        
        if (isLocalhost || isDebugMode) { // ローカルホストまたは明示的なデバッグモードでのみ有効
            this.createDebugPanel();
            this.loadSettings();
            this.applySettings();
        } else {
            // 非デバッグモードの場合、デフォルトで全て有効にする
            this._isParticleEnabled = true;
            this._isAnimationEnabled = true;
            this._isSoundEnabled = true;
            // アニメーション速度のCSS変数をデフォルト値に設定（必要に応じて）
            const root = document.documentElement;
            root.style.setProperty('--animation-speed-fast', '0.3s');
            root.style.setProperty('--animation-speed-normal', '0.6s');
            root.style.setProperty('--animation-speed-slow', '1.2s');
        }
    }
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        `;
        panel.innerHTML = `
            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 10px;">エフェクト制御</h3>
            <label style="display: block; margin-bottom: 10px;">
                <input type="checkbox" id="debug-particles" checked style="margin-right: 8px;">パーティクル効果
            </label>
            <label style="display: block; margin-bottom: 10px;">
                <input type="checkbox" id="debug-animations" checked style="margin-right: 8px;">アニメーション効果
            </label>
            <label style="display: block; margin-bottom: 15px;">
                <input type="checkbox" id="debug-sounds" checked style="margin-right: 8px;">音響効果
            </label>
            <button onclick="location.reload()" style="background: var(--luxury-accent-dark); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s;">リロード</button>
            <p style="font-size: 12px; margin-top: 15px; opacity: 0.7;">設定はリロード後に適用</p>
        `;
        document.body.appendChild(panel);
        this.particleCheckbox = document.getElementById('debug-particles');
        this.animationCheckbox = document.getElementById('debug-animations');
        this.soundCheckbox = document.getElementById('debug-sounds');
        this.particleCheckbox.addEventListener('change', () => this.saveSettings());
        this.animationCheckbox.addEventListener('change', () => this.saveSettings());
        this.soundCheckbox.addEventListener('change', () => this.saveSettings());
    }
    saveSettings() {
        localStorage.setItem('debugParticles', this.particleCheckbox.checked);
        localStorage.setItem('debugAnimations', this.animationCheckbox.checked);
        localStorage.setItem('debugSounds', this.soundCheckbox.checked);
    }
    loadSettings() {
        const particles = localStorage.getItem('debugParticles');
        const animations = localStorage.getItem('debugAnimations');
        const sounds = localStorage.getItem('debugSounds');
        this.particleCheckbox.checked = (particles === 'true' || particles === null); // デフォルトは有効
        this.animationCheckbox.checked = (animations === 'true' || animations === null); // デフォルトは有効
        this.soundCheckbox.checked = (sounds === 'true' || sounds === null); // デフォルトは有効
    }
    applySettings() {
        this._isParticleEnabled = this.particleCheckbox.checked;
        this._isAnimationEnabled = this.animationCheckbox.checked;
        this._isSoundEnabled = this.soundCheckbox.checked;
        // アニメーションをグローバルに制御するCSS変数を設定
        const root = document.documentElement;
        if (this._isAnimationEnabled) {
            root.style.setProperty('--animation-speed-fast', '0.3s');
            root.style.setProperty('--animation-speed-normal', '0.6s');
            root.style.setProperty('--animation-speed-slow', '1.2s');
        } else {
            root.style.setProperty('--animation-speed-fast', '0s');
            root.style.setProperty('--animation-speed-normal', '0s');
            root.style.setProperty('--animation-speed-slow', '0s');
        }
        // will-change も制御対象外とする (アニメーションが0sになるため実質不要だが念のため)
        if (!this._isAnimationEnabled) {
            document.querySelectorAll('[will-change]').forEach(el => {
                el.style.willChange = 'unset';
            });
        }
    }
    isParticleEnabled() {
        return this._isParticleEnabled;
    }
    isAnimationEnabled() {
        return this._isAnimationEnabled;
    }
    isSoundEnabled() {
        return this._isSoundEnabled;
    }
}
window.luxuryDebug = new LuxuryDebugPanel();