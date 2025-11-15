interface Card {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface CardStackContainerProps {
  cards: Card[];
  onCardClick: () => void;
  activeIndex: number;
  title?: string;
}

/**
 * CardStackContainer Component
 * A reusable component for displaying a stack of cards that can be cycled through
 * 
 * @param {Array} cards - Array of card objects with id, icon, and text properties
 * @param {Function} onCardClick - Function to call when a card is clicked
 * @param {number} activeIndex - Index of the currently active/top card
 * @param {string} title - Title to display above the card stack
 */
const CardStackContainer = ({ cards, onCardClick, activeIndex }: CardStackContainerProps) => {
  return (
    <div className="w-full">
      {/* Card Stack Container - Made much larger as requested */}
      <div className="relative flex justify-center items-center h-[500px] mb-12">
        <div 
          className="relative w-full max-w-4xl h-[400px] cursor-pointer"
          onClick={onCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onCardClick();
            }
          }}
          aria-label="Click to cycle through features"
        >
          {cards.map((card, index) => {
            // Calculate the "stack depth" for each card
            const stackDepth = (index - activeIndex + cards.length) % cards.length;

            // Render the icon component
            const IconComponent = card.icon;
            
            return (
              <div
                key={card.id}
                className={`
                  absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 
                  flex flex-col items-center justify-center p-8 transition-all duration-500 
                  ${stackDepth < 3 ? 'opacity-100' : 'opacity-0'}
                  hover:shadow-2xl
                `}
                style={{
                  transform: `translateY(${stackDepth < 3 ? stackDepth * -20 : -40}px) scale(${stackDepth < 3 ? 1 - stackDepth * 0.05 : 0.9})`,
                  zIndex: stackDepth < 3 ? cards.length - stackDepth : -1,
                  opacity: stackDepth < 3 ? 1 : 0,
                }}
              >
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-white p-4 rounded-full shadow-lg">
                    <IconComponent className="w-20 h-20 text-blue-600" />
                  </div>
                </div>
                <p className="text-center text-gray-800 text-xl md:text-2xl font-medium max-w-md">
                  {card.text}
                </p>
                <div className="mt-6 flex items-center justify-center">
                  <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-100 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-30 blur-2xl"></div>
      </div>
      
      {/* Instruction text */}
      <div className="text-center mt-4">
        <p className="text-gray-600 text-lg">
          Click on the card stack to explore our features
        </p>
      </div>
    </div>
  );
};

export default CardStackContainer;