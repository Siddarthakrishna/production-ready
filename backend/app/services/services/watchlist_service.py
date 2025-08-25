from . import , Optional, Dict, Any
from . import 
from . import 
from . import 
from . import , WatchlistUpdate
from . import , status

class WatchlistService:
    @staticmethod
    def get_watchlist(
        db: Session, 
        user_id: int, 
        page: int = 1, 
        page_size: int = 25
    ) -> Dict[str, Any]:
        """
        Get paginated watchlist for a user
        """
        offset = (page - 1) * page_size
        
        # Get total count for pagination
        total = db.query(Watchlist).filter(Watchlist.user_id == user_id).count()
        
        # Get paginated results
        items = (
            db.query(Watchlist)
            .filter(Watchlist.user_id == user_id)
            .order_by(Watchlist.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        
        pages = (total + page_size - 1) // page_size  # Ceiling division
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "pages": pages
        }
    
    @staticmethod
    def add_to_watchlist(
        db: Session, 
        user_id: int, 
        watchlist_item: WatchlistCreate
    ) -> Watchlist:
        """
        Add a new stock to user's watchlist
        """
        # Check if already in watchlist
        existing = (
            db.query(Watchlist)
            .filter(
                Watchlist.user_id == user_id,
                Watchlist.symbol == watchlist_item.symbol
            )
            .first()
        )
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{watchlist_item.symbol} is already in your watchlist"
            )
        
        # Create new watchlist item
        db_item = Watchlist(
            user_id=user_id,
            symbol=watchlist_item.symbol.upper(),
            target_price=watchlist_item.target_price
        )
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        return db_item
    
    @staticmethod
    def update_watchlist_item(
        db: Session,
        user_id: int,
        item_id: int,
        update_data: WatchlistUpdate
    ) -> Optional[Watchlist]:
        """
        Update a watchlist item (e.g., target price)
        """
        db_item = (
            db.query(Watchlist)
            .filter(
                Watchlist.id == item_id,
                Watchlist.user_id == user_id
            )
            .first()
        )
        
        if not db_item:
            return None
        
        # Update fields
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def remove_from_watchlist(
        db: Session,
        user_id: int,
        item_id: int
    ) -> bool:
        """
        Remove an item from watchlist
        """
        db_item = (
            db.query(Watchlist)
            .filter(
                Watchlist.id == item_id,
                Watchlist.user_id == user_id
            )
            .first()
        )
        
        if not db_item:
            return False
        
        db.delete(db_item)
        db.commit()
        return True
    
    @staticmethod
    def check_price_alerts(
        db: Session,
        symbol: str,
        current_price: float
    ) -> None:
        """
        Check if current price triggers any alerts for the given symbol
        """
        # Find all watchlist items for this symbol with target price
        watchlist_items = (
            db.query(Watchlist)
            .filter(
                Watchlist.symbol == symbol.upper(),
                Watchlist.alert_triggered == False,
                Watchlist.target_price.isnot(None),
                Watchlist.target_price <= current_price
            )
            .all()
        )
        
        # Update alert status for triggered items
        for item in watchlist_items:
            item.alert_triggered = True
        
        if watchlist_items:
            db.bulk_save_objects(watchlist_items)
            db.commit()
