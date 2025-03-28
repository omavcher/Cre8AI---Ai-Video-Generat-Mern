import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Wand2, Palette, Brain, Sparkles, Clock, Settings2 } from 'lucide-react';
import './AiSetting.css';

const directors = [
  {
    id: 'vanga',
    name: 'Sandeep Reddy Vanga',
    style: 'Intense, raw emotions, powerful action sequences',
    examples: 'Kabir Singh, Animal',
    imageUrl: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=400',
    expertise: ['Action', 'Drama', 'Emotional Depth', 'Raw Storytelling']
  },
  {
    id: 'nolan',
    name: 'Christopher Nolan',
    style: 'Sci-fi, mind-bending plots, deep storytelling',
    examples: 'Inception, Interstellar',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400',
    expertise: ['Science Fiction', 'Complex Narratives', 'Time Manipulation', 'Visual Effects']
  },
  {
    id: 'hirani',
    name: 'Rajkumar Hirani',
    style: 'Feel-good, emotional storytelling, humor with a message',
    examples: '3 Idiots, PK',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400',
    expertise: ['Comedy', 'Social Message', 'Character Development', 'Feel-good']
  },
  {
    id: 'tarantino',
    name: 'Quentin Tarantino',
    style: 'Non-linear storytelling, high action, unique dialogues',
    examples: 'Pulp Fiction, Kill Bill',
    imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=400',
    expertise: ['Non-linear Narrative', 'Dialogue', 'Action', 'Genre Mixing']
  }
];

const visualStyles = [
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Lifelike scenery and natural lighting',
    bestFor: 'Documentaries, serious content',
    previewUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=400',
    techniques: ['Natural Lighting', 'Real-world Textures', 'Photorealistic Rendering']
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Dramatic movie lighting and composition',
    bestFor: 'Short films, storytelling',
    previewUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400',
    techniques: ['Dynamic Lighting', 'Color Grading', 'Depth of Field']
  },
  {
    id: 'cartoon',
    name: 'Cartoon/Anime',
    description: 'Bright anime-like visuals',
    bestFor: 'Kids, fun storytelling',
    previewUrl: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&q=80&w=400',
    techniques: ['Cell Shading', 'Bold Colors', 'Expressive Animation']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk/Futuristic',
    description: 'Neon lights, high-tech aesthetic',
    bestFor: 'Sci-fi, gaming content',
    previewUrl: 'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&q=80&w=400',
    techniques: ['Neon Effects', 'Holographic Elements', 'Tech Overlays']
  }
];

function AiSetting() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aiSettings');
    return saved ? JSON.parse(saved) : {
      selectedDirector: '',
      selectedStyle: '',
      aiStrength: 75,
      processingSpeed: 'balanced',
      enhancedEffects: true
    };
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    localStorage.setItem('aiSettings', JSON.stringify(settings));
  }, [settings]);

  const resetSettings = () => {
    setSettings({
      selectedDirector: '',
      selectedStyle: '',
      aiStrength: 75,
      processingSpeed: 'balanced',
      enhancedEffects: true
    });
  };

  return (
    <div className="ai-container">
      <header className="ai-header">
        <div className="ai-header__title-group">
          <h1>AI Content Studio</h1>
          <span className="ai-header__subtitle">Advanced Content Generation</span>
        </div>
        <div className="ai-header__actions">
          <button className="ai-btn ai-btn--icon" onClick={resetSettings}>
            <RefreshCw size={20} />
            Reset
          </button>
          <button className="ai-btn ai-btn--icon ai-btn--primary" onClick={() => localStorage.setItem('aiSettings', JSON.stringify(settings))}>
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </header>

      <section className="ai-section">
        <div className="ai-section__header">
          <h2><Wand2 size={24} /> Director's Vision</h2>
          <p className="ai-section__description">Choose a directing style to influence your content</p>
        </div>
        <div className="ai-directors-grid">
          {directors.map((director) => (
            <div
              key={director.id}
              className={`ai-director-card ${settings.selectedDirector === director.id ? 'ai-director-card--selected' : ''}`}
              onClick={() => setSettings({ ...settings, selectedDirector: director.id })}
            >
              <div className="ai-director-card__image-container">
                <img src={director.imageUrl} alt={director.name} />
                <div className="ai-director-card__overlay">
                  <div className="ai-director-card__expertise">
                    {director.expertise.map((skill, index) => (
                      <span key={index} className="ai-director-card__tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ai-director-card__content">
                <h3>{director.name}</h3>
                <p className="ai-director-card__style">{director.style}</p>
                <p className="ai-director-card__examples">Known for: {director.examples}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-section">
        <div className="ai-section__header">
          <h2><Palette size={24} /> Visual Style</h2>
          <p className="ai-section__description">Select the visual aesthetic for your content</p>
        </div>
        <div className="ai-styles-grid">
          {visualStyles.map((style) => (
            <div
              key={style.id}
              className={`ai-style-card ${settings.selectedStyle === style.id ? 'ai-style-card--selected' : ''}`}
              onClick={() => setSettings({ ...settings, selectedStyle: style.id })}
            >
              <div className="ai-style-card__image-container">
                <img src={style.previewUrl} alt={style.name} />
                <div className="ai-style-card__techniques">
                  {style.techniques.map((technique, index) => (
                    <span key={index} className="ai-style-card__technique">{technique}</span>
                  ))}
                </div>
              </div>
              <div className="ai-style-card__content">
                <h3>{style.name}</h3>
                <p className="ai-style-card__description">{style.description}</p>
                <p className="ai-style-card__best-for">Best for: {style.bestFor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-section">
        <div className="ai-section__header">
          <h2><Settings2 size={24} /> Advanced Settings</h2>
          <button 
            className="ai-btn ai-btn--text" 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>
        
        {showAdvanced && (
          <div className="ai-advanced-settings">
            <div className="ai-setting-group">
              <label className="ai-setting-group__label">
                <Brain size={20} />
                AI Strength
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.aiStrength}
                onChange={(e) => setSettings({ ...settings, aiStrength: parseInt(e.target.value) })}
                className="ai-slider"
              />
              <span className="ai-setting-group__value">{settings.aiStrength}%</span>
            </div>

            <div className="ai-setting-group">
              <label className="ai-setting-group__label">
                <Clock size={20} />
                Processing Speed
              </label>
              <div className="ai-speed-options">
                {['fast', 'balanced', 'quality'].map((speed) => (
                  <button
                    key={speed}
                    className={`ai-speed-btn ${settings.processingSpeed === speed ? 'ai-speed-btn--active' : ''}`}
                    onClick={() => setSettings({ ...settings, processingSpeed: speed })}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="ai-setting-group">
              <label className="ai-setting-group__label">
                <Sparkles size={20} />
                Enhanced Effects
              </label>
              <label className="ai-toggle">
                <input
                  type="checkbox"
                  checked={settings.enhancedEffects}
                  onChange={(e) => setSettings({ ...settings, enhancedEffects: e.target.checked })}
                />
                <span className="ai-toggle__slider"></span>
              </label>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AiSetting;