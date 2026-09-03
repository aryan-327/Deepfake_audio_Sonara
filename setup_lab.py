import os
import sys
import subprocess

def print_step(message):
    print(f"\n[SETUP] {message}")
    print("-" * 50)

def verify_package(package_name, import_name=None):
    if import_name is None:
        import_name = package_name
    try:
        __import__(import_name)
        print(f"  -> '{package_name}' is already installed.")
    except ImportError:
        print(f"  -> '{package_name}' not found. Installing via pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])

def main():
    print_step("1. Verifying and Installing Required Dependencies")
    dependencies = [
        ("torch", "torch"),
        ("transformers", "transformers"),
        ("scikit-learn", "sklearn"),
        ("joblib", "joblib"),
        ("soundfile", "soundfile"),
        ("pandas", "pandas"),
        ("numpy", "numpy")
    ]
    for pkg, imp in dependencies:
        verify_package(pkg, imp)

    print_step("2. Creating Project Workspace Directories")
    dirs = ["models", "test_samples", "plots", "data"]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"  -> Directory ready: '{d}/'")

    print_step("3. Generating Sample Verification Files")
    # Create a dummy test audio path reference or placeholder if missing
    sample_real = "test_samples/1.wav"
    sample_fake = "test_samples/fake_3.wav"
    
    if not os.path.exists(sample_real):
        print(f"  -> Note: Place your real human test audio at '{sample_real}'")
    if not os.path.exists(sample_fake):
        print(f"  -> Note: Place your AI/spoof test audio at '{sample_fake}'")

    print_step("4. Checking Model Artifacts")
    expected_models = [
        "models/scaler_w2v2.joblib",
        "models/calibrated_svm_w2v2.joblib",
        "voting_ensemble_model.pkl"
    ]
    
    missing_models = [m for m in expected_models if not os.path.exists(m)]
    if missing_models:
        print("  -> WARNING: Some trained model weights are missing from disk:")
        for m in missing_models:
            print(f"     - {m}")
        print("     (The fallback/demo mode in your inference scripts will handle executions safely).")
    else:
        print("  -> All core model artifact files detected successfully!")

    print("\n" + "=" * 50)
    print(" SETUP COMPLETED SUCCESSFULLY! YOUR AI LAB IS READY. ")
    print("=" * 50)

if __name__ == "__main__":
    main()
