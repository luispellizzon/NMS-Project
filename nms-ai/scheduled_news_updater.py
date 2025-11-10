# scheduled_news_updater.py
"""
Automated News Updater for NMS-AI

This script can be run on a schedule (e.g., via cron or systemd timer)
to automatically generate fresh news articles for both medical and patient audiences.

Usage:
  python scheduled_news_updater.py [--medical] [--patient] [--both]

Examples:
  python scheduled_news_updater.py --both           # Update both audiences
  python scheduled_news_updater.py --medical        # Update medical news only
  python scheduled_news_updater.py --patient        # Update patient news only

Cron example (daily at 6 AM):
  0 6 * * * cd /path/to/nms-ai && python scheduled_news_updater.py --both
"""

import argparse
import requests
import logging
from datetime import datetime
import json
import time

# Configuration
BASE_URL = "http://localhost:8002"
HEADERS = {"Content-Type": "application/json"}
LOG_FILE = "news_updater.log"

# Topics to search for
MEDICAL_TOPICS = [
    "dementia alzheimer cognitive decline machine learning",
    "dementia early detection biomarkers",
    "alzheimer disease neuroimaging AI",
    "cognitive impairment digital health",
]

PATIENT_TOPICS = [
    "dementia prevention lifestyle",
    "alzheimer care support",
    "memory loss cognitive health",
    "brain health aging",
]

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)


def check_service_health():
    """Check if the agents service is running and healthy."""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            logging.info("✅ Agents service is healthy")
            return True
        else:
            logging.error(f"❌ Agents service returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        logging.error(f"❌ Cannot connect to agents service: {e}")
        return False


def generate_news(audience: str, topics: list, max_articles: int = 5):
    """
    Generate news articles for a specific audience.
    
    Args:
        audience: "medical" or "patient"
        topics: List of topic strings to search for
        max_articles: Maximum articles to generate per topic
    """
    logging.info(f"🔄 Generating {audience} news for {len(topics)} topics...")
    
    success_count = 0
    fail_count = 0
    
    for i, topic in enumerate(topics, 1):
        logging.info(f"  [{i}/{len(topics)}] Topic: {topic}")
        
        try:
            payload = {
                "audience": audience,
                "topic": topic,
                "max_articles": max_articles
            }
            
            response = requests.post(
                f"{BASE_URL}/generate-news",
                headers=HEADERS,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                logging.info(f"    ✅ Successfully queued news generation")
                success_count += 1
            else:
                logging.error(f"    ❌ Failed: {response.status_code} - {response.text}")
                fail_count += 1
            
            # Small delay between requests to avoid overwhelming the service
            time.sleep(2)
            
        except Exception as e:
            logging.error(f"    ❌ Error: {e}")
            fail_count += 1
    
    logging.info(f"✅ {audience.capitalize()} news: {success_count} succeeded, {fail_count} failed")
    return success_count, fail_count


def main():
    """Main function to run the scheduled news updater."""
    parser = argparse.ArgumentParser(
        description="Automated news updater for NMS-AI"
    )
    parser.add_argument(
        "--medical",
        action="store_true",
        help="Generate medical news for healthcare professionals"
    )
    parser.add_argument(
        "--patient",
        action="store_true",
        help="Generate patient news for patients and caregivers"
    )
    parser.add_argument(
        "--both",
        action="store_true",
        help="Generate news for both audiences"
    )
    parser.add_argument(
        "--max-articles",
        type=int,
        default=3,
        help="Maximum articles per topic (default: 3)"
    )
    
    args = parser.parse_args()
    
    # If no audience specified, default to both
    if not (args.medical or args.patient or args.both):
        args.both = True
    
    # Start logging
    logging.info("="*60)
    logging.info("🚀 NMS-AI Scheduled News Updater")
    logging.info(f"📅 Run time: {datetime.now().isoformat()}")
    logging.info("="*60)
    
    # Check service health first
    if not check_service_health():
        logging.error("❌ Agents service is not available. Exiting.")
        return 1
    
    # Track overall statistics
    total_success = 0
    total_fail = 0
    
    # Generate medical news
    if args.medical or args.both:
        logging.info("\n📰 Generating medical news...")
        success, fail = generate_news(
            audience="medical",
            topics=MEDICAL_TOPICS,
            max_articles=args.max_articles
        )
        total_success += success
        total_fail += fail
    
    # Generate patient news
    if args.patient or args.both:
        logging.info("\n📰 Generating patient news...")
        success, fail = generate_news(
            audience="patient",
            topics=PATIENT_TOPICS,
            max_articles=args.max_articles
        )
        total_success += success
        total_fail += fail
    
    # Summary
    logging.info("\n" + "="*60)
    logging.info("📊 SUMMARY")
    logging.info("="*60)
    logging.info(f"Total requests succeeded: {total_success}")
    logging.info(f"Total requests failed: {total_fail}")
    logging.info(f"Success rate: {total_success/(total_success+total_fail)*100:.1f}%")
    logging.info("="*60)
    logging.info("\n💡 TIP: Check Firestore collections for results:")
    logging.info("   - medical_news")
    logging.info("   - patient_news")
    logging.info("="*60)
    
    # Return exit code based on failures
    return 0 if total_fail == 0 else 1


if __name__ == "__main__":
    exit(main())
