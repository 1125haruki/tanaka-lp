// ===================================================================
// NEO菌活 JavaScript (リファクタリング版 & 最終調整済み)
// - 郵便番号からの住所自動入力機能を、動作していた(3)のコードを参考に修正
// - 複数のAPIを試すフォールバック機能を実装し、安定性を向上
// ===================================================================


document.addEventListener('DOMContentLoaded', () => {


    // --- 設定値の一元管理 ---
    const CONFIG = {
        animation: {
            duration: 1000,
            shortDuration: 500,
            carouselAutoplay: 5000,
        },
        effects: {
            counterParticles: 5,
            validationParticles: 3,
            focusSparkles: 4,
            confettiCount: 25,
        },
        selectors: {
            animatedItems: '.animated-item',
            underlineAnimated: '.underline-animated',
            progressBar: '#progress-bar',
            loadingOverlay: '#loading-overlay',
            ctaButtons: '[id^="cta-button-open-form-"]',
            allImages: 'img[loading="lazy"]',
            // 各セクションのID
            trustSection: '#trust-section-js',
            voiceSection: '#voice-section-js',
            // カルーセル関連
            carousel: '#testimonialCarousel',
            carouselTrack: '#testimonialTrack',
            prevBtn: '#prevBtn',
            nextBtn: '#nextBtn',
            indicators: '#indicators',
            // フォーム関連
            orderFormContainer: '#order-form-direct',
            orderForm: '#order-form-direct form',
            formSuccess: '#formSuccess',
        }
    };


    // --- グローバルな初期化処理 ---
    const progressBar = document.querySelector(CONFIG.selectors.progressBar);
    const loadingOverlay = document.querySelector(CONFIG.selectors.loadingOverlay);


    // ローディング画面制御
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, CONFIG.animation.duration);
    });
    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }, CONFIG.animation.shortDuration);




    // プログレスバー更新
    const updateProgressBar = () => {
        if (!progressBar) return;
        const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollableHeight <= 0) return;
        const progress = (window.scrollY / scrollableHeight) * 100;
        progressBar.style.width = `${progress}%`;
    };
    window.addEventListener('scroll', updateProgressBar, { passive: true });
    updateProgressBar();


    // Intersection Observerによるスクロールアニメーション
    const observer = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                if (entry.target.matches(CONFIG.selectors.trustSection) && !window.luxuryStatisticsInstance) {
                    window.luxuryStatisticsInstance = new LuxuryStatistics(CONFIG.effects);
                }
                if (entry.target.matches(CONFIG.selectors.voiceSection) && !window.luxuryTestimonialsInstance) {
                    window.luxuryTestimonialsInstance = new LuxuryTestimonials(CONFIG.animation.carouselAutoplay);
                }
                obs.unobserve(entry.target);
            }
        }
    }, { threshold: 0.1 });


    document.querySelectorAll(`${CONFIG.selectors.animatedItems}, ${CONFIG.selectors.trustSection}, ${CONFIG.selectors.voiceSection}, ${CONFIG.selectors.underlineAnimated}`).forEach(el => observer.observe(el));
    
    // 画像のエラーハンドリング
    document.querySelectorAll(CONFIG.selectors.allImages).forEach(img => {
        img.addEventListener('error', () => {
            img.style.display = 'none';
            const container = img.closest('.profile-image-container, .problem-circle, .service-image, .point-media, .reason-image-wrapper');
            if (container) {
                container.classList.add('no-image');
            }
        });
    });


    // --- お客様の声カルーセルクラス ---
    class LuxuryTestimonials {
        constructor(autoplayDelay) {
            this.carousel = document.querySelector(CONFIG.selectors.carousel);
            this.track = document.querySelector(CONFIG.selectors.carouselTrack);
            this.prevBtn = document.querySelector(CONFIG.selectors.prevBtn);
            this.nextBtn = document.querySelector(CONFIG.selectors.nextBtn);
            this.indicatorsContainer = document.querySelector(CONFIG.selectors.indicators);
            if (!this.carousel || !this.track || !this.prevBtn || !this.nextBtn || !this.indicatorsContainer) return;


            this.cards = Array.from(this.track.children);
            this.currentIndex = 0;
            this.autoplayInterval = null;
            this.autoplayDelay = autoplayDelay;
            this.init();
        }


        init() {
            this.createIndicators();
            this.setupEventListeners();
            this.updateCarousel();
            this.startAutoplay();
        }


        createIndicators() {
            this.indicatorsContainer.innerHTML = '';
            this.cards.forEach((_, index) => {
                const button = document.createElement('button');
                button.setAttribute('aria-label', `スライド ${index + 1}へ移動`);
                button.className = 'indicator';
                button.addEventListener('click', () => this.goToSlide(index));
                this.indicatorsContainer.appendChild(button);
            });
        }


        setupEventListeners() {
            this.prevBtn.addEventListener('click', () => this.goToSlide(this.currentIndex - 1));
            this.nextBtn.addEventListener('click', () => this.goToSlide(this.currentIndex + 1));


            this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoplay());


            let startX = 0, currentX = 0, isDragging = false;
            this.track.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                isDragging = true;
                this.stopAutoplay();
                this.track.style.transition = 'none';
            }, { passive: true });


            this.track.addEventListener('touchmove', e => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                this.track.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${diff}px))`;
            }, { passive: true });
            
            this.track.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                const diff = currentX - startX;
                this.track.style.transition = '';
                if (Math.abs(diff) > 50) {
                    this.goToSlide(this.currentIndex + (diff < 0 ? 1 : -1));
                } else {
                    this.updateCarousel();
                }
                this.startAutoplay();
            });
        }
        
        goToSlide(index) {
            this.currentIndex = (index + this.cards.length) % this.cards.length;
            this.updateCarousel();
            this.resetAutoplay();
        }


        updateCarousel() {
            if (!this.track) return;
            this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
            this.indicatorsContainer.querySelectorAll('.indicator').forEach((indicator, i) => {
                indicator.classList.toggle('active', i === this.currentIndex);
            });
        }


        startAutoplay() {
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => this.goToSlide(this.currentIndex + 1), this.autoplayDelay);
        }
        stopAutoplay() {
            clearInterval(this.autoplayInterval);
        }
        resetAutoplay() {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }
    
    // --- 実績・信頼性セクションクラス ---
    class LuxuryStatistics {
        constructor(effectsConfig) {
            this.effectsConfig = effectsConfig;
            this.init();
        }
        
        init() {
            const statSection = document.querySelector(CONFIG.selectors.trustSection);
            if (!statSection) return;


            const statObserver = new IntersectionObserver((entries, obs) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        this.animateCounters(entry.target);
                        obs.unobserve(entry.target);
                    }
                }
            }, { threshold: 0.5 });


            statSection.querySelectorAll('.stat-number[data-count]').forEach(counter => {
                statObserver.observe(counter);
            });


            this.animateProgressBars();
        }


        animateCounters(counter) {
            const target = parseInt(counter.dataset.count, 10);
            const duration = 2000;
            let current = 0;
            const step = (target / duration) * 16;


            const update = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                    this.createParticles(counter, this.effectsConfig.counterParticles, 'var(--luxury-accent)');
                }
            };
            update();
        }


        animateProgressBars() {
            const progressBars = document.querySelectorAll('.trust-section .progress-bar[data-progress]');
            progressBars.forEach(bar => {
                bar.style.width = `${bar.dataset.progress}%`;
            });
        }
        
        createParticles(element, count, color) {
            const rect = element.getBoundingClientRect();
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                Object.assign(particle.style, {
                    position: 'fixed',
                    left: `${rect.left + rect.width / 2}px`,
                    top: `${rect.top + rect.height / 2}px`,
                    width: '4px', height: '4px',
                    background: color,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: '1000',
                });
                document.body.appendChild(particle);


                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * 50 + 50;
                particle.animate([
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => particle.remove();
            }
        }
    }
    
    // --- 申し込みフォームクラス ---
    class LuxuryForm {
        constructor(formElement, effectsConfig) {
            this.form = formElement;
            if (!this.form) return;
            this.effectsConfig = effectsConfig;
            this.submitBtn = this.form.querySelector('.luxury-submit-btn');
            this.successDiv = document.querySelector(CONFIG.selectors.formSuccess);
            this.addressStatus = this.form.querySelector('#addressStatus');
            this.zipcodeInput = this.form.querySelector('#zipcode');
            this.addressInput = this.form.querySelector('#address');
            this.init();
        }


        init() {
            this.form.addEventListener('submit', e => this.handleSubmit(e));
            this.form.addEventListener('input', e => {
                if (e.target.tagName === 'INPUT') this.validateInput(e.target);
            });
            if(this.zipcodeInput) {
                // ★修正：(3)のコードを参考に、APIの頻繁な呼び出しを防ぐ「デバウンス」処理を追加
                this.zipcodeInput.addEventListener('input', () => this.handleZipcodeDebounced());
            }
            this.form.querySelectorAll('input').forEach(input => {
                input.addEventListener('focus', () => {
                     this.createParticles(input, this.effectsConfig.focusSparkles, 'var(--luxury-accent)');
                });
            });
            // デバウンス用のタイマーID
            this.debounceTimer = null;
        }
        
        // ★追加：郵便番号入力のデバウンス処理
        handleZipcodeDebounced() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.handleZipcode();
            }, 300); // ユーザーの入力が300ミリ秒止まったら実行
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            if (!this.validateForm()) {
                this.shake(this.form);
                return;
            }


            this.submitBtn.classList.add('loading');
            try {
                await fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(new FormData(this.form)).toString(),
                });
                this.showSuccess();
            } catch (error) {
                alert("フォームの送信中にエラーが発生しました。");
                this.submitBtn.classList.remove('loading');
            }
        }


        validateForm() {
            return Array.from(this.form.querySelectorAll('input[required]')).every(input => {
                this.validateInput(input);
                return input.checkValidity();
            });
        }


        validateInput(input) {
            input.classList.remove('valid', 'invalid');
            if(input.value.trim() === '') return;
            const isValid = input.checkValidity();
            input.classList.add(isValid ? 'valid' : 'invalid');
            if(isValid) {
                this.createParticles(input, this.effectsConfig.validationParticles, 'var(--primary-green)');
            }
        }
        
        // ★修正：(3)のコードを参考に、フォールバック機能を持つfetchAddressを呼び出すように修正
        async handleZipcode() {
            const zipcode = this.zipcodeInput.value.replace(/[^0-9]/g, '');
            if (zipcode.length !== 7) {
                return; // 7桁でなければ何もしない
            }


            this.updateAddressStatus('住所を検索中...', 'loading');
            try {
                const address = await this.fetchAddress(zipcode);
                if (address) {
                    this.addressInput.value = address;
                    // ★修正：手入力もできるようにreadonlyは付けない
                    this.validateInput(this.addressInput);
                    this.updateAddressStatus('住所が自動入力されました', 'success');
                    setTimeout(() => this.updateAddressStatus('', 'hidden'), 3000);
                } else {
                    throw new Error('All APIs failed');
                }
            } catch (error) {
                this.addressInput.removeAttribute('readonly'); // ★追加
                this.updateAddressStatus('住所が見つかりません。手入力してください。', 'error');
            }
        }


        // ★追加：(3)のコードを移植し、複数のAPIを試すフォールバック機能を実装
        async fetchAddress(zipCode) {
            const addressAPIs = [
                {
                    name: 'zipcode-jp',
                    fetch: () => {
                        return new Promise((resolve, reject) => {
                            const callbackName = 'zipjp_callback_' + Date.now();
                            const script = document.createElement('script');
                            const timeoutId = setTimeout(() => {
                                cleanup();
                                reject(new Error('zipcode-jp: Timeout'));
                            }, 5000);


                            const cleanup = () => {
                                clearTimeout(timeoutId);
                                if (script.parentNode) script.parentNode.removeChild(script);
                                delete window[callbackName];
                            };


                            window[callbackName] = (data) => {
                                cleanup();
                                if (data && data.code === 200 && data.data) {
                                    resolve(`${data.data.prefecture}${data.data.city}${data.data.town || ''}`);
                                } else {
                                    reject(new Error('zipcode-jp: Address not found'));
                                }
                            };
                            script.onerror = () => {
                                cleanup();
                                reject(new Error('zipcode-jp: Network error'));
                            };


                            script.src = `https://zipcode-jp.com/${zipCode}.js?callback=${callbackName}`;
                            document.head.appendChild(script);
                        });
                    }
                },
                {
                    name: 'zipaddress.net',
                    fetch: async () => {
                        const response = await fetch(`https://api.zipaddress.net/?zipcode=${zipCode}`);
                        if (!response.ok) throw new Error(`zipaddress.net: HTTP error ${response.status}`);
                        const data = await response.json();
                        if (data.code === 200 && data.data) {
                            return `${data.data.pref}${data.data.city}${data.data.town || ''}`;
                        }
                        throw new Error('zipaddress.net: Address not found');
                    }
                }
            ];


            for (const api of addressAPIs) {
                try {
                    const address = await api.fetch();
                    if (address) return address; // 成功したら住所を返す
                } catch (error) {
                    console.error(`API ${api.name} failed:`, error);
                    continue; // 失敗したら次のAPIを試す
                }
            }
            return null; // 全てのAPIで失敗した場合
        }


        updateAddressStatus(message, type) {
            if (!this.addressStatus) return;
            this.addressStatus.textContent = message;
            this.addressStatus.className = `address-status visible ${type}`;
        }
        
        showSuccess() {
            this.form.style.display = 'none';
            if(this.successDiv) this.successDiv.classList.add('show');
            this.createConfetti();
        }
        
        createConfetti() {
            const colors = ['var(--luxury-accent)', 'var(--luxury-accent-dark)', '#98FB98', '#87CEEB', 'var(--highlight-yellow)'];
            for (let i = 0; i < this.effectsConfig.confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                Object.assign(confetti.style, {
                    left: `${Math.random() * 100}vw`,
                    top: '-10px',
                    background: colors[Math.floor(Math.random() * colors.length)],
                    animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`
                });
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 5000);
            }
        }


        shake(element) {
            element.animate([
                { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' }, { transform: 'translateX(-10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 500, easing: 'ease-in-out' });
        }
        
        reset() {
            this.form.reset();
            this.form.querySelectorAll('.valid, .invalid').forEach(el => el.classList.remove('valid', 'invalid'));
            this.updateAddressStatus('', 'hidden');
            this.form.style.display = '';
            if(this.successDiv) this.successDiv.classList.remove('show');
            if(this.submitBtn) this.submitBtn.classList.remove('loading');
        }
        
        createParticles(element, count, color) {
            if (!element) return;
            const rect = element.getBoundingClientRect();
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                Object.assign(particle.style, {
                    position: 'fixed',
                    left: `${rect.left + Math.random() * rect.width}px`,
                    top: `${rect.top + rect.height / 2}px`,
                    width: '3px', height: '3px',
                    background: color,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: '1000'
                });
                document.body.appendChild(particle);


                particle.animate([
                    { transform: 'scale(1) translateY(0)', opacity: 1 },
                    { transform: 'scale(0) translateY(-20px)', opacity: 0 }
                ], { duration: 800, easing: 'ease-out' }).onfinish = () => particle.remove();
            }
        }
    }
    
    // --- CTAボタンとフォームの連携 ---
    const formContainer = document.querySelector(CONFIG.selectors.orderFormContainer);
    const formElement = document.querySelector(CONFIG.selectors.orderForm);
    let formInstance = null;
    
    if (formContainer && formElement) {
        document.body.addEventListener('click', (e) => {
            const ctaButton = e.target.closest(CONFIG.selectors.ctaButtons);
            if (ctaButton) {
                e.preventDefault();
                if (!formInstance) {
                    formInstance = new LuxuryForm(formElement, CONFIG.effects);
                }
                formContainer.classList.remove('form-initial-hidden');
                formInstance.reset();
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // ▼▼▼ 修正箇所 ▼▼▼
    // --- Q&Aアコーディオン機能 (スマホでの誤操作防止機能付き) ---
    const initQAAccordion = () => {
        document.querySelectorAll('.qa-item .question').forEach(question => {
            
            // スマホでのスワイプとタップの競合を防ぐためのリスナー
            question.addEventListener('touchstart', e => {
                // 'question' 要素上でタッチが開始された場合、イベントの伝播を停止する。
                // これにより、親要素であるカルーセルのスワイプ処理が開始されるのを防ぐ。
                e.stopPropagation();
            });

            // タップ/クリックでアコーディオンを開閉するためのリスナー
            question.addEventListener('click', e => {
                // デフォルトのリンク挙動などをキャンセル
                e.preventDefault();
                
                const qaItem = question.closest('.qa-item');
                if (!qaItem) return;

                const wasActive = qaItem.classList.contains('active');
                
                // 一旦すべてのアクティブな項目を閉じる
                document.querySelectorAll('.qa-item.active').forEach(item => {
                    if (item !== qaItem) {
                        item.classList.remove('active');
                    }
                });

                // クリックされた項目を開閉する
                qaItem.classList.toggle('active', !wasActive);
            });
        });
    };

    // Q&Aアコーディオンを初期化
    initQAAccordion();
    // ▲▲▲ 修正箇所 ▲▲▲

});